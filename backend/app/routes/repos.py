from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.repository import Repository
from app.services.github import GitHubService

router = APIRouter(prefix="/repos", tags=["repositories"])


@router.get("/")
async def get_user_repositories(user_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch + sync all repos for a user from GitHub, return them."""
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    github = GitHubService(user.access_token)
    repos_data = await github.get_user_repos()

    for rd in repos_data:
        result = await db.execute(select(Repository).where(Repository.github_id == rd["id"]))
        repo = result.scalar_one_or_none()
        if repo:
            repo.stars = rd.get("stargazers_count", repo.stars)
            repo.forks = rd.get("forks_count", repo.forks)
            repo.watchers = rd.get("watchers_count", repo.watchers)
            repo.open_issues = rd.get("open_issues_count", repo.open_issues)
            repo.description = rd.get("description")
            repo.language = rd.get("language")
        else:
            repo = Repository(
                github_id=rd["id"],
                name=rd["name"],
                full_name=rd["full_name"],
                description=rd.get("description"),
                language=rd.get("language"),
                stars=rd.get("stargazers_count", 0),
                forks=rd.get("forks_count", 0),
                watchers=rd.get("watchers_count", 0),
                open_issues=rd.get("open_issues_count", 0),
                html_url=rd.get("html_url"),
                private=1 if rd.get("private") else 0,
                owner_id=user.id,
            )
            db.add(repo)

    await db.commit()

    db_result = await db.execute(select(Repository).where(Repository.owner_id == user_id))
    db_repos = db_result.scalars().all()

    return [
        {
            "id": r.id,
            "github_id": r.github_id,
            "name": r.name,
            "full_name": r.full_name,
            "description": r.description,
            "language": r.language,
            "stars": r.stars,
            "forks": r.forks,
            "watchers": r.watchers,
            "open_issues": r.open_issues,
            "html_url": r.html_url,
            "private": bool(r.private),
        }
        for r in db_repos
    ]


@router.get("/activity")
async def get_user_activity(user_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch recent activity feed for the user."""
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    github = GitHubService(user.access_token)
    events = await github.get_user_events(user.username)
    return events


@router.get("/{repo_id}")
async def get_repository(repo_id: int, user_id: int, db: AsyncSession = Depends(get_db)):
    """Return single repository with analysis if available."""
    from sqlalchemy.orm import selectinload
    stmt = select(Repository).options(selectinload(Repository.analysis)).where(Repository.id == repo_id)
    result = await db.execute(stmt)
    repo = result.scalar_one_or_none()

    if not repo or repo.owner_id != user_id:
        raise HTTPException(status_code=404, detail="Repository not found")

    analysis_data = None
    if repo.analysis:
        a = repo.analysis
        analysis_data = {
            "commit_frequency": a.commit_frequency,
            "top_contributors": a.top_contributors,
            "language_breakdown": a.language_breakdown,
            "issues_ratio": a.issues_ratio,
            "pr_stats": a.pr_stats,
            "stars_trend": a.stars_trend,
            "popularity_score": a.popularity_score,
            "analysis_date": str(a.analysis_date),
        }

    return {
        "id": repo.id,
        "github_id": repo.github_id,
        "name": repo.name,
        "full_name": repo.full_name,
        "description": repo.description,
        "language": repo.language,
        "stars": repo.stars,
        "forks": repo.forks,
        "watchers": repo.watchers,
        "open_issues": repo.open_issues,
        "html_url": repo.html_url,
        "private": bool(repo.private),
        "analysis": analysis_data,
    }