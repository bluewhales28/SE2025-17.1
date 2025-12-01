"""
Service package initialization
"""
from app.services.analytics_service import AnalyticsService
from app.services.cache_service import cache_service
from app.services.pdf_service import pdf_service
from app.services.external_service import quiz_service, class_service, notification_service
from app.services.fraud_detection import FraudDetectionService

__all__ = [
    "AnalyticsService",
    "cache_service",
    "pdf_service",
    "quiz_service",
    "class_service",
    "notification_service",
    "FraudDetectionService",
]


