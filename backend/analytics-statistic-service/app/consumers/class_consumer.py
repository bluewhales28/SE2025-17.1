"""
Kafka consumer for class-related events
"""

import asyncio
import json

from aiokafka import AIOKafkaConsumer

from app.config import settings
from app.services.cache_service import cache_service


class ClassConsumer:
    """Consumer for class-related Kafka events"""

    def __init__(self):
        self.bootstrap_servers = settings.kafka_bootstrap_servers
        self.class_topic = settings.kafka_class_topic
        self.group_id = settings.kafka_group_id
        self.consumer = None

    async def start(self):
        """Start the Kafka consumer"""
        self.consumer = AIOKafkaConsumer(
            self.class_topic,
            bootstrap_servers=self.bootstrap_servers,
            group_id=self.group_id,
            value_deserializer=lambda m: json.loads(m.decode("utf-8")),
            auto_offset_reset="earliest",
            enable_auto_commit=True,
        )
        await self.consumer.start()
        print(f"Kafka consumer started for topic: {self.class_topic}")

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
        event_type = data.get("event_type")

        if event_type == "class_updated":
            await self.handle_class_updated(data)
        elif event_type == "student_enrolled":
            await self.handle_student_enrolled(data)
        elif event_type == "student_removed":
            await self.handle_student_removed(data)
        else:
            print(f"Unknown event type: {event_type}")

    async def handle_class_updated(self, data: dict):
        """
        Handle class update event

        Args:
            data: Class update data
        """
        class_id = data.get("class_id")
        print(f"Processing class update: class_id={class_id}")

        # Invalidate class cache
        await cache_service.invalidate_class_cache(class_id)

        print(f"Class update processed successfully")

    async def handle_student_enrolled(self, data: dict):
        """
        Handle student enrollment event

        Args:
            data: Enrollment data
        """
        class_id = data.get("class_id")
        student_id = data.get("student_id")
        print(
            f"Processing student enrollment: class_id={class_id}, student_id={student_id}"
        )

        # Invalidate caches
        await cache_service.invalidate_class_cache(class_id)
        await cache_service.invalidate_student_cache(student_id)

        print(f"Student enrollment processed successfully")

    async def handle_student_removed(self, data: dict):
        """
        Handle student removal event

        Args:
            data: Removal data
        """
        class_id = data.get("class_id")
        student_id = data.get("student_id")
        print(
            f"Processing student removal: class_id={class_id}, student_id={student_id}"
        )

        # Invalidate caches
        await cache_service.invalidate_class_cache(class_id)
        await cache_service.invalidate_student_cache(student_id)

        print(f"Student removal processed successfully")


async def start_class_consumer():
    """Start the class consumer"""
    consumer = ClassConsumer()
    await consumer.start()


if __name__ == "__main__":
    asyncio.run(start_class_consumer())
