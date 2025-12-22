import pika
import json
import logging
from typing import Dict, Any
from app.core import config
from app.services.analytics_service import AnalyticsService
from app.services.alert_service import AlertService
from app.services.cache_service import CacheService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EventConsumer:
    """RabbitMQ consumer for quiz events"""
    
    def __init__(self):
        self.analytics_service = AnalyticsService()
        self.alert_service = AlertService()
        self.cache_service = CacheService()
        self.connection = None
        self.channel = None
    
    def connect(self):
        """Connect to RabbitMQ"""
        try:
            self.connection = pika.BlockingConnection(
                pika.URLParameters(config.RABBITMQ_URL)
            )
            self.channel = self.connection.channel()
            self.channel.queue_declare(queue=config.ANALYTICS_QUEUE, durable=True)
            logger.info("Connected to RabbitMQ")
        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            raise
    
    def on_quiz_submitted(self, ch, method, properties, body):
        """Handle quiz_submitted event"""
        try:
            event = json.loads(body)
            logger.info(f"Received quiz_submitted event: {event}")
            
            quiz_id = event.get('quiz_id')
            user_id = event.get('user_id')
            score = event.get('score')
            total_score = event.get('total_score')
            
            # Invalidate cache for this quiz
            self.cache_service.invalidate_pattern(f"quiz_report:{quiz_id}:*")
            self.cache_service.invalidate_pattern(f"student_report:{user_id}:*")
            
            # Check for alerts (cheating detection)
            if quiz_id:
                alerts = self.alert_service.detect_cheating(quiz_id, user_id, score, total_score)
                if alerts:
                    # Send alert to admin dashboard (via notification service)
                    self.alert_service.send_alert(alerts)
            
            ch.basic_ack(delivery_tag=method.delivery_tag)
            
        except Exception as e:
            logger.error(f"Error processing quiz_submitted event: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    
    def start_consuming(self):
        """Start consuming events"""
        if not self.channel:
            self.connect()
        
        self.channel.basic_consume(
            queue=config.ANALYTICS_QUEUE,
            on_message_callback=self.on_quiz_submitted
        )
        
        logger.info("Starting to consume events...")
        try:
            self.channel.start_consuming()
        except KeyboardInterrupt:
            self.channel.stop_consuming()
            self.connection.close()
            logger.info("Stopped consuming events")

