import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import async_engine, Base
from app.routes import auth, repos, analysis, ws, settings

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
app.include_router(settings.router)


@app.on_event("startup")
async def startup_event():
    logger.info("Starting Gitlytics API...")
    async with async_engine.begin() as conn:
        # Import all models so Base knows about them
        from app.models import User, Repository, RepoAnalysis, TaskStatus  # noqa
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified.")


@app.get("/")
async def root():
    return {"message": "🚀 Gitlytics API is running!", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)