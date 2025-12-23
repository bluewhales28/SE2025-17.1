import redis
import json
from typing import Optional, Any
from app.core import config

class CacheService:
    """Redis cache service for analytics data"""
    
    def __init__(self):
        self.redis_client = redis.Redis(
            host=config.REDIS_HOST if hasattr(config, 'REDIS_HOST') else 'redis',
            port=config.REDIS_PORT if hasattr(config, 'REDIS_PORT') else 6379,
            db=0,
            decode_responses=True
        )
        self.ttl = config.CACHE_TTL_SECONDS
    
    def get(self, key: str) -> Optional[Any]:
        """Get cached value"""
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set cached value"""
        try:
            ttl = ttl or self.ttl
            serialized = json.dumps(value)
            return self.redis_client.setex(key, ttl, serialized)
        except Exception as e:
            print(f"Cache set error: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete cached value"""
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            print(f"Cache delete error: {e}")
            return False
    
    def invalidate_pattern(self, pattern: str) -> int:
        """Invalidate all keys matching pattern"""
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            print(f"Cache invalidate error: {e}")
            return 0

