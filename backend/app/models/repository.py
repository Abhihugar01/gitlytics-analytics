from sqlalchemy import Column, Integer, String, Text, Float, JSON, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(Integer, unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    language = Column(String(100), nullable=True)
    stars = Column(Integer, default=0)
    forks = Column(Integer, default=0)
    watchers = Column(Integer, default=0)
    open_issues = Column(Integer, default=0)
    html_url = Column(Text, nullable=True)
    private = Column(Integer, default=0)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="repositories")
    analysis = relationship("RepoAnalysis", back_populates="repository", uselist=False, cascade="all, delete-orphan")


class RepoAnalysis(Base):
    __tablename__ = "repo_analysis"

    id = Column(Integer, primary_key=True, index=True)
    repository_id = Column(Integer, ForeignKey("repositories.id"), unique=True, nullable=False)
    commit_frequency = Column(JSON, nullable=True)
    top_contributors = Column(JSON, nullable=True)
    language_breakdown = Column(JSON, nullable=True)
    issues_ratio = Column(Float, nullable=True)
    pr_stats = Column(JSON, nullable=True)
    stars_trend = Column(JSON, nullable=True)
    popularity_score = Column(Float, nullable=True)
    health_score = Column(Float, nullable=True)
    security_alerts = Column(JSON, nullable=True)
    developer_metrics = Column(JSON, nullable=True)
    ai_summary = Column(Text, nullable=True)
    analysis_date = Column(DateTime(timezone=True), server_default=func.now())

    repository = relationship("Repository", back_populates="analysis")
