"""
Pydantic schemas for reports and analytics
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ReportType(str, Enum):
    """Report types"""

    QUIZ = "quiz"
    STUDENT = "student"
    CLASS = "class"
    QUESTION = "question"


class StatisticsData(BaseModel):
    """Basic statistics data"""

    mean: float
    median: float
    std_dev: float
    min_score: float
    max_score: float
    count: int
    percentile_25: float
    percentile_50: float
    percentile_75: float


class QuizReportResponse(BaseModel):
    """Quiz report response schema"""

    quiz_id: int
    quiz_title: str
    total_attempts: int
    unique_students: int
    statistics: StatisticsData
    completion_rate: float
    average_time_minutes: float
    pass_rate: float
    score_distribution: Dict[str, int]
    difficulty_analysis: Dict[str, Any]
    topic_analysis: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class StudentProgressResponse(BaseModel):
    """Student progress response schema"""

    student_id: int
    student_name: str
    total_quizzes_attempted: int
    total_quizzes_completed: int
    average_score: float
    best_score: float
    worst_score: float
    completion_rate: float
    total_time_spent_minutes: float
    progress_over_time: List[Dict[str, Any]]
    strengths: List[str]
    weaknesses: List[str]
    topic_performance: Dict[str, Dict[str, float]]
    recent_attempts: List[Dict[str, Any]]

    class Config:
        from_attributes = True


class LeaderboardEntry(BaseModel):
    """Leaderboard entry"""

    student_id: int
    student_name: str
    score: float
    rank: int
    completion_rate: float


class ClassStatisticsResponse(BaseModel):
    """Class statistics response schema"""

    class_id: int
    class_name: str
    total_students: int
    active_students: int
    total_quizzes: int
    average_score: float
    completion_rate: float
    pass_rate: float
    statistics: StatisticsData
    leaderboard: List[LeaderboardEntry]
    score_distribution: Dict[str, int]
    activity_timeline: List[Dict[str, Any]]
    top_performers: List[Dict[str, Any]]
    struggling_students: List[Dict[str, Any]]

    class Config:
        from_attributes = True


class QuestionAnalysisResponse(BaseModel):
    """Question analysis response schema"""

    question_id: int
    question_text: str
    question_type: str
    total_attempts: int
    correct_attempts: int
    incorrect_attempts: int
    accuracy_rate: float
    difficulty_index: float
    discrimination_index: float
    average_time_seconds: float
    options_analysis: Optional[List[Dict[str, Any]]] = None
    common_mistakes: List[str]
    topic: Optional[str] = None
    difficulty_level: Optional[str] = None

    class Config:
        from_attributes = True


class ExportRequest(BaseModel):
    """Export request schema"""

    report_type: ReportType
    entity_id: int
    format: str = Field(default="pdf", pattern="^(pdf|csv)$")
    include_charts: bool = True
    date_range: Optional[Dict[str, str]] = None

    class Config:
        from_attributes = True


class CertificateRequest(BaseModel):
    """Certificate generation request"""

    student_id: int
    quiz_id: Optional[int] = None
    class_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    score: Optional[float] = None
    completion_date: datetime
    template_name: Optional[str] = "default"
    custom_data: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class CertificateResponse(BaseModel):
    """Certificate response schema"""

    certificate_id: int
    certificate_number: str
    student_id: int
    pdf_path: str
    issued_at: datetime

    class Config:
        from_attributes = True


class AlertEventResponse(BaseModel):
    """Alert event response schema"""

    alert_id: int
    type: str
    severity: str
    title: str
    description: Optional[str]
    quiz_id: Optional[int]
    student_id: Optional[int]
    submission_id: Optional[int]
    data: Dict[str, Any]
    resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True
