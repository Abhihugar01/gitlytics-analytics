from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.config import settings

# Async database setup (for FastAPI)
_async_url = settings.DATABASE_URL.replace(
    "postgresql://", "postgresql+asyncpg://"
).replace(
    "postgres://", "postgresql+asyncpg://"
)

async_engine = create_async_engine(_async_url, echo=False, future=True)
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    expire_on_commit=False,
    class_=AsyncSession,
)

# Sync database setup (for Celery Worker)
# We use psycopg2 for synchronous tasks
_sync_url = settings.DATABASE_URL.replace(
    "postgresql+asyncpg://", "postgresql://"
).replace(
    "postgresql://", "postgresql+psycopg2://"
)

sync_engine = create_engine(_sync_url, echo=False, future=True)
SessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()