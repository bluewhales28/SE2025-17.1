"""
Configuration management for Analytics Service
"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field
import json


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    app_name: str = "Analytics Service"
    app_version: str = "1.0.0"
    debug: bool = True
    environment: str = "development"
    
    # Database
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/analytics_db"
    database_pool_size: int = 20
    database_max_overflow: int = 0
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    redis_cache_ttl: int = 3600
    
    # Message Queue - Kafka
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_quiz_topic: str = "quiz_submitted"
    kafka_class_topic: str = "class_updated"
    kafka_group_id: str = "analytics_service"
    
    # Message Queue - RabbitMQ
    rabbitmq_url: str = "amqp://guest:guest@localhost:5672/"
    rabbitmq_quiz_queue: str = "quiz_submitted"
    rabbitmq_class_queue: str = "class_updated"
    
    # External Services
    quiz_service_url: str = "http://localhost:8001"
    class_service_url: str = "http://localhost:8002"
    notification_service_url: str = "http://localhost:8003"
    auth_service_url: str = "http://localhost:8000"
    
    # JWT Authentication
    jwt_secret_key: str = "your-secret-key-here-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration: int = 3600
    
    # CORS
    cors_origins: str = '["http://localhost:3000", "http://localhost:8080"]'
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from JSON string"""
        try:
            return json.loads(self.cors_origins)
        except:
            return ["http://localhost:3000"]
    
    # Rate Limiting
    rate_limit_enabled: bool = True
    rate_limit_requests: int = 100
    rate_limit_period: int = 60
    
    # PDF Generation
    pdf_output_dir: str = "./reports/pdf"
    certificate_template_dir: str = "./app/templates"
    font_dir: str = "./fonts"
    
    # Fraud Detection
    fraud_detection_enabled: bool = True
    similarity_threshold: float = 0.9
    abnormal_speed_threshold: int = 30  # seconds
    pattern_anomaly_threshold: float = 0.8
    
    # Scheduled Jobs
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/1"
    enable_scheduled_jobs: bool = True
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "json"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()


