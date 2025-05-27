# models/api_spec.py
from sqlalchemy import Column, Integer, String, Enum, DateTime
from sqlalchemy.sql import func
from db.database import Base

class ApiSpec(Base):
    __tablename__ = "api_spec"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, nullable=False)
    api_name = Column(String(50), nullable=False)
    endpoint = Column(String(255), nullable=False)
    method = Column(Enum('GET', 'POST', 'PUT', 'DELETE', 'PATCH'), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    status = Column(Enum('시작 전', '진행 중', '완료'), default='시작 전', nullable=False)
    header = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    is_deleted = Column(Integer, default=0, nullable=False)
