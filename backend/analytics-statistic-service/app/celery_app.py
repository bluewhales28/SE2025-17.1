"""
Celery configuration for scheduled tasks
"""
from celery import Celery
from app.core import config
from app.tasks.scheduled_jobs import ScheduledJobs

celery_app = Celery(
    'analytics_tasks',
    broker=config.RABBITMQ_URL,
    backend='rpc://'
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

@celery_app.task(name='update_analytics_cache')
def update_analytics_cache_task():
    """Celery task to update analytics cache"""
    jobs = ScheduledJobs()
    jobs.update_analytics_cache()

@celery_app.task(name='update_class_statistics')
def update_class_statistics_task():
    """Celery task to update class statistics"""
    jobs = ScheduledJobs()
    jobs.update_class_statistics()

@celery_app.task(name='cleanup_old_cache')
def cleanup_old_cache_task():
    """Celery task to cleanup old cache"""
    jobs = ScheduledJobs()
    jobs.cleanup_old_cache()

@celery_app.task(name='generate_daily_report')
def generate_daily_report_task():
    """Celery task to generate daily report"""
    jobs = ScheduledJobs()
    return jobs.generate_daily_report()

# Schedule periodic tasks
celery_app.conf.beat_schedule = {
    'update-analytics-cache-every-hour': {
        'task': 'update_analytics_cache',
        'schedule': 3600.0,  # Every hour
    },
    'update-class-statistics-daily': {
        'task': 'update_class_statistics',
        'schedule': 86400.0,  # Daily
    },
    'cleanup-cache-weekly': {
        'task': 'cleanup_old_cache',
        'schedule': 604800.0,  # Weekly
    },
    'generate-daily-report': {
        'task': 'generate_daily_report',
        'schedule': 86400.0,  # Daily at midnight
    },
}

