from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, func
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(Integer, unique=True, index=True, nullable=False)
    username = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True)
    avatar_url = Column(Text, nullable=True)
    name = Column(String(200), nullable=True)
    bio = Column(Text, nullable=True)
    public_repos = Column(Integer, default=0)
    followers = Column(Integer, default=0)
    following = Column(Integer, default=0)
    access_token = Column(Text, nullable=False)
    notification_settings = Column(JSON, default=lambda: {"email": True, "slack": True, "push": False})
    alert_rules = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    repositories = relationship("Repository", back_populates="owner", cascade="all, delete-orphan")