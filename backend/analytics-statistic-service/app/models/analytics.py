"""
Analytics models for storing cached data and reports
"""

import enum
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB

from app.models.base import BaseModel


class SeverityLevel(str, enum.Enum):
    """Alert severity levels"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ReportType(str, enum.Enum):
    """Report types"""

    QUIZ = "quiz"
    STUDENT = "student"
    CLASS = "class"
    QUESTION = "question"
    CUSTOM = "custom"


class AnalyticsCache(BaseModel):
    """Cached analytics data for fast retrieval"""

    __tablename__ = "analytics_cache"

    quiz_id = Column(Integer, nullable=True, index=True)
    student_id = Column(Integer, nullable=True, index=True)
    class_id = Column(Integer, nullable=True, index=True)
    question_id = Column(Integer, nullable=True, index=True)

    # Cached metrics as JSON
    metrics = Column(JSONB, nullable=False, default=dict)

    # Metadata
    cache_key = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=True)


class Report(BaseModel):
    """Report metadata and file paths"""

    __tablename__ = "reports"

    type = Column(SQLEnum(ReportType), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # File information
    file_path = Column(String(500), nullable=True)
    file_format = Column(String(10), nullable=False)  # pdf, csv, excel
    file_size = Column(Integer, nullable=True)

    # Reference IDs
    quiz_id = Column(Integer, nullable=True, index=True)
    student_id = Column(Integer, nullable=True, index=True)
    class_id = Column(Integer, nullable=True, index=True)

    # Creator
    created_by = Column(Integer, nullable=False)

    # Parameters used to generate report
    parameters = Column(JSONB, nullable=True, default=dict)


class AlertEvent(BaseModel):
    """Alert events for fraud detection and anomalies"""

    __tablename__ = "alert_events"

    type = Column(String(100), nullable=False, index=True)
    severity = Column(SQLEnum(SeverityLevel), nullable=False, index=True)

    # Alert details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    data = Column(JSONB, nullable=False, default=dict)

    # References
    quiz_id = Column(Integer, nullable=True, index=True)
    student_id = Column(Integer, nullable=True, index=True)
    submission_id = Column(Integer, nullable=True, index=True)

    # Status
    resolved = Column(Integer, default=0)  # 0 = not resolved, 1 = resolved
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(Integer, nullable=True)
    resolution_note = Column(Text, nullable=True)


class Certificate(BaseModel):
    """Certificate records"""

    __tablename__ = "certificates"

    student_id = Column(Integer, nullable=False, index=True)
    quiz_id = Column(Integer, nullable=True, index=True)
    class_id = Column(Integer, nullable=True, index=True)

    # Certificate details
    certificate_number = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Score and completion
    score = Column(Float, nullable=True)
    completion_date = Column(DateTime, nullable=False)

    # File
    pdf_path = Column(String(500), nullable=False)
    pdf_size = Column(Integer, nullable=True)

    # Template and customization
    template_name = Column(String(100), nullable=True)
    custom_data = Column(JSONB, nullable=True, default=dict)

    # Issuance
    issued_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    issued_by = Column(Integer, nullable=True)
