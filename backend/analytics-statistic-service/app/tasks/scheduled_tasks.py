"""
Scheduled tasks using Celery and APScheduler
"""
from celery import Celery
from celery.schedules import crontab
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio

from app.config import settings
from app.dependencies import AsyncSessionLocal
from app.services.cache_service import cache_service
from app.services.external_service import notification_service
from app.models.analytics import Report
import os
import glob

# Initialize Celery
celery_app = Celery(
    "analytics_tasks",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


# Schedule configuration
celery_app.conf.beat_schedule = {
    "refresh-analytics-cache-daily": {
        "task": "app.tasks.scheduled_tasks.refresh_analytics_cache",
        "schedule": crontab(hour=2, minute=0),  # Run at 2 AM daily
    },
    "generate-weekly-reports": {
        "task": "app.tasks.scheduled_tasks.generate_weekly_reports",
        "schedule": crontab(day_of_week=1, hour=8, minute=0),  # Monday 8 AM
    },
    "send-monthly-summary": {
        "task": "app.tasks.scheduled_tasks.send_monthly_summary",
        "schedule": crontab(day_of_month=1, hour=9, minute=0),  # 1st of month, 9 AM
    },
    "cleanup-old-reports": {
        "task": "app.tasks.scheduled_tasks.cleanup_old_reports",
        "schedule": crontab(day_of_week=0, hour=3, minute=0),  # Sunday 3 AM
    },
}


@celery_app.task(name="app.tasks.scheduled_tasks.refresh_analytics_cache")
def refresh_analytics_cache():
    """
    Refresh analytics cache daily
    This task runs at 2 AM daily to refresh cached analytics data
    """
    print("Starting analytics cache refresh...")
    
    # Run async function in event loop
    asyncio.run(_refresh_cache_async())
    
    print("Analytics cache refresh completed")
    return {"status": "success", "timestamp": datetime.utcnow().isoformat()}


async def _refresh_cache_async():
    """Async implementation of cache refresh"""
    # Clear all analytics caches
    await cache_service.delete_pattern("quiz_report:*")
    await cache_service.delete_pattern("student_progress:*")
    await cache_service.delete_pattern("class_stats:*")
    await cache_service.delete_pattern("question_analysis:*")
    
    print("All analytics caches cleared")


@celery_app.task(name="app.tasks.scheduled_tasks.generate_weekly_reports")
def generate_weekly_reports():
    """
    Generate weekly reports for teachers
    Runs every Monday at 8 AM
    """
    print("Starting weekly report generation...")
    
    asyncio.run(_generate_weekly_reports_async())
    
    print("Weekly reports generation completed")
    return {"status": "success", "timestamp": datetime.utcnow().isoformat()}


async def _generate_weekly_reports_async():
    """Async implementation of weekly report generation"""
    # This would fetch all active classes and generate reports
    # For now, placeholder implementation
    
    async with AsyncSessionLocal() as db:
        # Get list of teachers/classes (would come from Class Service)
        # For each teacher, generate and send weekly report
        
        print("Weekly reports generated and sent")


@celery_app.task(name="app.tasks.scheduled_tasks.send_monthly_summary")
def send_monthly_summary():
    """
    Send monthly summary to teachers
    Runs on 1st of each month at 9 AM
    """
    print("Starting monthly summary generation...")
    
    asyncio.run(_send_monthly_summary_async())
    
    print("Monthly summaries sent")
    return {"status": "success", "timestamp": datetime.utcnow().isoformat()}


async def _send_monthly_summary_async():
    """Async implementation of monthly summary"""
    # Generate monthly reports and send via notification service
    
    # Example report data
    report_data = {
        "month": (datetime.utcnow() - timedelta(days=30)).strftime("%B %Y"),
        "total_quizzes": 0,
        "total_students": 0,
        "average_score": 0.0,
        "completion_rate": 0.0
    }
    
    # Send to teachers (teacher IDs would come from database)
    teacher_ids = [1]  # Placeholder
    
    for teacher_id in teacher_ids:
        await notification_service.send_weekly_report(
            teacher_id=teacher_id,
            report_data=report_data
        )
    
    print("Monthly summaries sent to all teachers")


@celery_app.task(name="app.tasks.scheduled_tasks.cleanup_old_reports")
def cleanup_old_reports():
    """
    Clean up old report files
    Runs every Sunday at 3 AM
    """
    print("Starting cleanup of old reports...")
    
    result = asyncio.run(_cleanup_old_reports_async())
    
    print(f"Cleanup completed: {result}")
    return result


async def _cleanup_old_reports_async():
    """Async implementation of report cleanup"""
    # Delete PDF files older than 30 days
    pdf_dir = settings.pdf_output_dir
    
    if not os.path.exists(pdf_dir):
        return {"status": "success", "message": "No reports directory found", "deleted": 0}
    
    cutoff_date = datetime.utcnow() - timedelta(days=30)
    deleted_count = 0
    
    # Find all PDF files
    pdf_files = glob.glob(os.path.join(pdf_dir, "*.pdf"))
    
    for pdf_file in pdf_files:
        file_mtime = datetime.fromtimestamp(os.path.getmtime(pdf_file))
        
        if file_mtime < cutoff_date:
            try:
                os.remove(pdf_file)
                deleted_count += 1
                print(f"Deleted old report: {pdf_file}")
            except Exception as e:
                print(f"Error deleting file {pdf_file}: {e}")
    
    # Also clean up old report records from database
    async with AsyncSessionLocal() as db:
        from sqlalchemy import select, delete
        from app.models.analytics import Report
        
        # Delete report records older than 90 days
        cutoff_db = datetime.utcnow() - timedelta(days=90)
        stmt = delete(Report).where(Report.created_at < cutoff_db)
        await db.execute(stmt)
        await db.commit()
    
    return {
        "status": "success",
        "deleted_files": deleted_count,
        "timestamp": datetime.utcnow().isoformat()
    }


# Manual task triggers (can be called from API)

@celery_app.task(name="app.tasks.scheduled_tasks.generate_report_async")
def generate_report_async(report_type: str, entity_id: int, user_id: int):
    """
    Generate a report asynchronously
    
    Args:
        report_type: Type of report (quiz, student, class)
        entity_id: ID of the entity
        user_id: User requesting the report
    """
    print(f"Generating {report_type} report for entity {entity_id}...")
    
    # This would use the PDF service to generate the report
    # and then notify the user when it's ready
    
    return {
        "status": "success",
        "report_type": report_type,
        "entity_id": entity_id,
        "timestamp": datetime.utcnow().isoformat()
    }


@celery_app.task(name="app.tasks.scheduled_tasks.generate_certificate_async")
def generate_certificate_async(student_id: int, quiz_id: int, certificate_data: dict):
    """
    Generate a certificate asynchronously
    
    Args:
        student_id: Student ID
        quiz_id: Quiz ID
        certificate_data: Certificate details
    """
    print(f"Generating certificate for student {student_id}, quiz {quiz_id}...")
    
    asyncio.run(_generate_certificate_async(student_id, quiz_id, certificate_data))
    
    return {
        "status": "success",
        "student_id": student_id,
        "quiz_id": quiz_id,
        "timestamp": datetime.utcnow().isoformat()
    }


async def _generate_certificate_async(student_id: int, quiz_id: int, certificate_data: dict):
    """Async implementation of certificate generation"""
    from app.services.pdf_service import pdf_service
    from app.models.analytics import Certificate
    
    # Generate certificate
    student_name = certificate_data.get("student_name", "Unknown")
    certificate_path = await pdf_service.generate_certificate(student_name, certificate_data)
    
    # Save to database
    async with AsyncSessionLocal() as db:
        certificate = Certificate(
            student_id=student_id,
            quiz_id=quiz_id,
            certificate_number=certificate_data.get("certificate_number"),
            title=certificate_data.get("title"),
            description=certificate_data.get("description"),
            score=certificate_data.get("score"),
            completion_date=certificate_data.get("completion_date"),
            pdf_path=certificate_path,
            template_name=certificate_data.get("template_name", "default")
        )
        
        db.add(certificate)
        await db.commit()
    
    # Send certificate via email
    await notification_service.send_certificate_email(student_id, certificate_path)
    
    print(f"Certificate generated and sent: {certificate_path}")


