# models/functional_spec.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from db.database import Base

class FunctionalSpec(Base):
    __tablename__ = "functional_spec"  # ✅ 소문자 일관성, 리눅스 MySQL 호환

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)

    is_deleted = Column(Integer, nullable=False, default=0)

    category = Column(String(100), nullable=False)
    fail_case = Column(String(1000), nullable=True)
    function_description = Column(String(100), nullable=False)
    function_name = Column(String(100), nullable=False)
    priority = Column(Integer, nullable=True)
    story_point = Column(Integer, nullable=False)
    success_case = Column(String(255), nullable=True)

    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

