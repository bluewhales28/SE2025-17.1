"""
Kafka consumer for quiz-related events
"""
import asyncio
import json
from aiokafka import AIOKafkaConsumer
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import AsyncSessionLocal
from app.services.cache_service import cache_service
from app.services.fraud_detection import FraudDetectionService


class QuizConsumer:
    """Consumer for quiz-related Kafka events"""
    
    def __init__(self):
        self.bootstrap_servers = settings.kafka_bootstrap_servers
        self.quiz_topic = settings.kafka_quiz_topic
        self.group_id = settings.kafka_group_id
        self.consumer = None
    
    async def start(self):
        """Start the Kafka consumer"""
        self.consumer = AIOKafkaConsumer(
            self.quiz_topic,
            bootstrap_servers=self.bootstrap_servers,
            group_id=self.group_id,
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            auto_offset_reset='earliest',
            enable_auto_commit=True
        )
        await self.consumer.start()
        print(f"Kafka consumer started for topic: {self.quiz_topic}")
        
        try:
            async for message in self.consumer:
                await self.process_message(message.value)
        except Exception as e:
            print(f"Error in Kafka consumer: {e}")
        finally:
            await self.stop()
    
    async def stop(self):
        """Stop the Kafka consumer"""
        if self.consumer:
            await self.consumer.stop()
            print("Kafka consumer stopped")
    
    async def process_message(self, data: dict):
        """
        Process incoming message
        
        Args:
            data: Message data
        """
        event_type = data.get('event_type')
        
        if event_type == 'quiz_submitted':
            await self.handle_quiz_submitted(data)
        elif event_type == 'quiz_updated':
            await self.handle_quiz_updated(data)
        elif event_type == 'quiz_deleted':
            await self.handle_quiz_deleted(data)
        else:
            print(f"Unknown event type: {event_type}")
    
    async def handle_quiz_submitted(self, data: dict):
        """
        Handle quiz submission event
        
        Args:
            data: Submission data
        """
        quiz_id = data.get('quiz_id')
        student_id = data.get('student_id')
        submission = data.get('submission')
        
        print(f"Processing quiz submission: quiz_id={quiz_id}, student_id={student_id}")
        
        # Invalidate related caches
        await cache_service.invalidate_quiz_cache(quiz_id)
        await cache_service.invalidate_student_cache(student_id)
        
        # Run fraud detection if enabled
        if settings.fraud_detection_enabled:
            async with AsyncSessionLocal() as db:
                fraud_service = FraudDetectionService(db)
                
                # Check for abnormal speed
                average_time = data.get('average_time', 0)
                await fraud_service.detect_abnormal_speed(quiz_id, submission, average_time)
                
                # Check for pattern anomalies
                await fraud_service.detect_pattern_anomaly(quiz_id, submission)
        
        print(f"Quiz submission processed successfully")
    
    async def handle_quiz_updated(self, data: dict):
        """
        Handle quiz update event
        
        Args:
            data: Quiz update data
        """
        quiz_id = data.get('quiz_id')
        print(f"Processing quiz update: quiz_id={quiz_id}")
        
        # Invalidate quiz cache
        await cache_service.invalidate_quiz_cache(quiz_id)
        
        print(f"Quiz update processed successfully")
    
    async def handle_quiz_deleted(self, data: dict):
        """
        Handle quiz deletion event
        
        Args:
            data: Quiz deletion data
        """
        quiz_id = data.get('quiz_id')
        print(f"Processing quiz deletion: quiz_id={quiz_id}")
        
        # Invalidate quiz cache
        await cache_service.invalidate_quiz_cache(quiz_id)
        
        print(f"Quiz deletion processed successfully")


async def start_quiz_consumer():
    """Start the quiz consumer"""
    consumer = QuizConsumer()
    await consumer.start()


if __name__ == "__main__":
    asyncio.run(start_quiz_consumer())


