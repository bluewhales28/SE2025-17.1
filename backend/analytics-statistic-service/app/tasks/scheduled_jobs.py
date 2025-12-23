"""
Scheduled jobs for analytics updates
Can be run via Celery or cron
"""
import logging
from datetime import datetime, timedelta
from app.services.analytics_service import AnalyticsService
from app.services.cache_service import CacheService
from app.db.connection import get_db_connection

logger = logging.getLogger(__name__)

class ScheduledJobs:
    """Scheduled background jobs"""
    
    def __init__(self):
        self.analytics_service = AnalyticsService()
        self.cache_service = CacheService()
    
    def update_analytics_cache(self):
        """Update analytics cache for all quizzes"""
        logger.info("Starting analytics cache update...")
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get all quiz IDs
        cur.execute("SELECT DISTINCT quiz_id FROM quiz_attempt_events")
        quiz_ids = [row["quiz_id"] for row in cur.fetchall()]
        
        # Update cache for each quiz
        for quiz_id in quiz_ids:
            try:
                self.analytics_service.quiz_report(quiz_id, use_cache=False)
                logger.info(f"Updated cache for quiz {quiz_id}")
            except Exception as e:
                logger.error(f"Failed to update cache for quiz {quiz_id}: {e}")
        
        conn.close()
        logger.info("Analytics cache update completed")
    
    def update_class_statistics(self):
        """Update class engagement statistics"""
        logger.info("Starting class statistics update...")
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get all class IDs
        cur.execute("SELECT DISTINCT class_id FROM quiz_attempt_events WHERE class_id IS NOT NULL")
        class_ids = [row["class_id"] for row in cur.fetchall()]
        
        for class_id in class_ids:
            try:
                self.analytics_service.class_report(class_id, use_cache=False)
                logger.info(f"Updated statistics for class {class_id}")
            except Exception as e:
                logger.error(f"Failed to update statistics for class {class_id}: {e}")
        
        conn.close()
        logger.info("Class statistics update completed")
    
    def cleanup_old_cache(self, days: int = 7):
        """Clean up cache older than specified days"""
        logger.info(f"Cleaning up cache older than {days} days...")
        
        # Invalidate old cache patterns
        patterns = [
            "quiz_report:*",
            "student_report:*",
            "class_report:*",
            "question_analysis:*"
        ]
        
        for pattern in patterns:
            deleted = self.cache_service.invalidate_pattern(pattern)
            logger.info(f"Deleted {deleted} keys matching {pattern}")
        
        logger.info("Cache cleanup completed")
    
    def generate_daily_report(self):
        """Generate daily analytics report"""
        logger.info("Generating daily report...")
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        yesterday = datetime.now() - timedelta(days=1)
        
        # Get statistics for yesterday
        cur.execute("""
            SELECT 
                COUNT(DISTINCT quiz_id) as total_quizzes,
                COUNT(*) as total_attempts,
                COUNT(DISTINCT user_id) as unique_students,
                AVG(score::float / total_score * 100) as avg_score
            FROM quiz_attempt_events
            WHERE DATE(submitted_at) = %s
        """, (yesterday.date(),))
        
        stats = cur.fetchone()
        conn.close()
        
        logger.info(f"Daily report: {stats}")
        return stats

