from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Gitlytics"
    SECRET_KEY: str = "changeme-super-secret-key-32chars"
    DEBUG: bool = False

    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_REDIRECT_URI: str = "http://localhost:8000/auth/github/callback"

    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/gitlytics"
    REDIS_URL: str = "redis://localhost:6379/0"
    FRONTEND_URL: str = "http://localhost:3000"
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
