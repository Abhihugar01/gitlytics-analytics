from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, func
from sqlalchemy import Enum as SAEnum
import enum
from app.database import Base


class TaskStatusEnum(str, enum.Enum):
    PENDING = "pending"
    STARTED = "started"
    SUCCESS = "success"
    FAILURE = "failure"


class TaskStatus(Base):
    __tablename__ = "task_status"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String(255), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    repo_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)
    status = Column(SAEnum(TaskStatusEnum), default=TaskStatusEnum.PENDING)
    result = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())