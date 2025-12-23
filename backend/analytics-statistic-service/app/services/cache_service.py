"""
Redis cache service for analytics data
"""

import hashlib
import json
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from redis import asyncio as aioredis

from app.config import settings
from app.dependencies import get_redis


class CacheService:
    """Redis-based caching service"""

    def __init__(self):
        self.default_ttl = settings.redis_cache_ttl

    @staticmethod
    def generate_cache_key(prefix: str, **kwargs) -> str:
        """
        Generate a unique cache key from parameters

        Args:
            prefix: Cache key prefix
            **kwargs: Parameters to include in cache key

        Returns:
            Unique cache key string
        """
        # Sort kwargs for consistent key generation
        sorted_items = sorted(kwargs.items())
        key_data = f"{prefix}:{'_'.join(f'{k}={v}' for k, v in sorted_items)}"

        # Hash for long keys
        if len(key_data) > 200:
            hash_suffix = hashlib.md5(key_data.encode(), usedforsecurity=False).hexdigest()[:10]
            return f"{prefix}:{hash_suffix}"

        return key_data

    async def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found
        """
        try:
            redis = await get_redis()
            value = await redis.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """
        Set value in cache

        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds (default: from config)

        Returns:
            True if successful, False otherwise
        """
        try:
            redis = await get_redis()
            ttl = ttl or self.default_ttl
            serialized = json.dumps(value, default=str)
            await redis.setex(key, ttl, serialized)
            return True
        except Exception as e:
            print(f"Cache set error: {e}")
            return False

    async def delete(self, key: str) -> bool:
        """
        Delete key from cache

        Args:
            key: Cache key

        Returns:
            True if successful, False otherwise
        """
        try:
            redis = await get_redis()
            await redis.delete(key)
            return True
        except Exception as e:
            print(f"Cache delete error: {e}")
            return False

    async def delete_pattern(self, pattern: str) -> bool:
        """
        Delete all keys matching pattern

        Args:
            pattern: Key pattern (e.g., "quiz:*")

        Returns:
            True if successful, False otherwise
        """
        try:
            redis = await get_redis()
            cursor = 0
            while True:
                cursor, keys = await redis.scan(cursor, match=pattern, count=100)
                if keys:
                    await redis.delete(*keys)
                if cursor == 0:
                    break
            return True
        except Exception as e:
            print(f"Cache delete pattern error: {e}")
            return False

    async def get_or_compute(
        self, key: str, compute_func, ttl: Optional[int] = None, *args, **kwargs
    ) -> Any:
        """
        Get value from cache or compute if not exists

        Args:
            key: Cache key
            compute_func: Async function to compute value if not cached
            ttl: Time to live in seconds
            *args: Arguments for compute function
            **kwargs: Keyword arguments for compute function

        Returns:
            Cached or computed value
        """
        # Try to get from cache
        cached_value = await self.get(key)
        if cached_value is not None:
            return cached_value

        # Compute value
        computed_value = await compute_func(*args, **kwargs)

        # Cache the computed value
        await self.set(key, computed_value, ttl)

        return computed_value

    async def invalidate_quiz_cache(self, quiz_id: int) -> bool:
        """
        Invalidate all cache related to a quiz

        Args:
            quiz_id: Quiz ID

        Returns:
            True if successful
        """
        patterns = [
            f"quiz_report:{quiz_id}:*",
            f"quiz_stats:{quiz_id}:*",
            f"question_analysis:*:quiz:{quiz_id}:*",
        ]

        for pattern in patterns:
            await self.delete_pattern(pattern)

        return True

    async def invalidate_student_cache(self, student_id: int) -> bool:
        """
        Invalidate all cache related to a student

        Args:
            student_id: Student ID

        Returns:
            True if successful
        """
        patterns = [f"student_progress:{student_id}:*", f"student_stats:{student_id}:*"]

        for pattern in patterns:
            await self.delete_pattern(pattern)

        return True

    async def invalidate_class_cache(self, class_id: int) -> bool:
        """
        Invalidate all cache related to a class

        Args:
            class_id: Class ID

        Returns:
            True if successful
        """
        patterns = [f"class_stats:{class_id}:*", f"class_leaderboard:{class_id}:*"]

        for pattern in patterns:
            await self.delete_pattern(pattern)

        return True


# Global cache service instance
cache_service = CacheService()
