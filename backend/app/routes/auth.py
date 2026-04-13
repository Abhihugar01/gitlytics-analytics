import httpx
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.config import settings
from jose import jwt
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["auth"])

GITHUB_OAUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"


def create_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.utcnow() + timedelta(days=7),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def get_effective_redirect_uri(request: Request) -> str:
    """Dynamically determine the redirect URI based on the request."""
    # If GITHUB_REDIRECT_URI is explicitly set and not empty, use it.
    if settings.GITHUB_REDIRECT_URI:
        return settings.GITHUB_REDIRECT_URI
    
    # Otherwise, build it from the request
    # On Render, we need to ensure https
    scheme = "https" if "render.com" in str(request.base_url) else request.url.scheme
    base = str(request.base_url).rstrip("/")
    if "localhost" not in base and "render.com" in base:
        base = base.replace("http://", "https://")
    
    return f"{base}/auth/github/callback"


@router.get("/github")
async def github_login(request: Request):
    """Redirect URL for GitHub OAuth login."""
    redirect_uri = get_effective_redirect_uri(request)
    params = (
        f"client_id={settings.GITHUB_CLIENT_ID}"
        f"&redirect_uri={redirect_uri}"
        f"&scope=repo+user"
    )
    return RedirectResponse(url=f"{GITHUB_OAUTH_URL}?{params}")


@router.get("/github/callback")
async def github_callback(request: Request, code: str, db: AsyncSession = Depends(get_db)):
    """Handle GitHub OAuth callback, exchange code for token, upsert user."""
    redirect_uri = get_effective_redirect_uri(request)
    async with httpx.AsyncClient(timeout=20.0) as client:
        # Exchange code for access token
        token_resp = await client.post(
            GITHUB_TOKEN_URL,
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": redirect_uri,
            },
            headers={"Accept": "application/json"},
        )
        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to obtain access token from GitHub")

        # Fetch user profile
        user_resp = await client.get(
            GITHUB_USER_URL,
            headers={
                "Authorization": f"token {access_token}",
                "Accept": "application/vnd.github.v3+json",
            },
        )
        user_data = user_resp.json()

    # Upsert user
    result = await db.execute(select(User).where(User.github_id == user_data["id"]))
    user = result.scalar_one_or_none()

    if user:
        user.access_token = access_token
        user.username = user_data.get("login", user.username)
        user.avatar_url = user_data.get("avatar_url", user.avatar_url)
        user.name = user_data.get("name")
        user.bio = user_data.get("bio")
        user.public_repos = user_data.get("public_repos", 0)
        user.followers = user_data.get("followers", 0)
        user.following = user_data.get("following", 0)
    else:
        user = User(
            github_id=user_data["id"],
            username=user_data.get("login", ""),
            email=user_data.get("email"),
            avatar_url=user_data.get("avatar_url"),
            name=user_data.get("name"),
            bio=user_data.get("bio"),
            public_repos=user_data.get("public_repos", 0),
            followers=user_data.get("followers", 0),
            following=user_data.get("following", 0),
            access_token=access_token,
        )
        db.add(user)

    await db.commit()
    await db.refresh(user)

    jwt_token = create_token(user.id)
    # Redirect back to frontend root with token and user_id
    # In monolith, this is just /
    return RedirectResponse(
        url=f"/?token={jwt_token}&user_id={user.id}"
    )


@router.get("/me")
async def get_current_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Return current user profile."""
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "github_id": user.github_id,
        "username": user.username,
        "email": user.email,
        "avatar_url": user.avatar_url,
        "name": user.name,
        "bio": user.bio,
        "public_repos": user.public_repos,
        "followers": user.followers,
        "following": user.following,
    }