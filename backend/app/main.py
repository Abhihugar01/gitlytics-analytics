import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import settings
from app.database import async_engine, Base
from app.routes import auth, repos, analysis, ws, settings as user_settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Gitlytics API",
    description="GitHub Analytics Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(repos.router)
app.include_router(analysis.router)
app.include_router(ws.router)
app.include_router(user_settings.router)


@app.on_event("startup")
async def startup_event():
    logger.info("Starting Gitlytics API...")
    async with async_engine.begin() as conn:
        # Import all models so Base knows about them
        from app.models import User, Repository, RepoAnalysis, TaskStatus  # noqa
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified.")


# Serve Static Files (The built React Frontend)
# This will be created during Render's build command
static_path = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_path):
    # Vite builds put assets in an 'assets' folder
    assets_path = os.path.join(static_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

@app.get("/health")
async def health():
    return {"status": "ok"}

# Catch-all route to serve the React SPA
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Skip API routes and static files
    if full_path.startswith("api") or full_path.startswith("static") or full_path.startswith("docs"):
        return {"error": "Not Found"}
    
    index_path = os.path.join(static_path, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"message": "🚀 Gitlytics API is running!", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)