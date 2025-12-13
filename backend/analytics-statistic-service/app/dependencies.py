"""
Dependency injection for Analytics Service
"""

from typing import AsyncGenerator

from redis import asyncio as aioredis
from sqlalchemy.ext.asyncio import (AsyncSession, async_sessionmaker,
                                    create_async_engine)

from app.config import settings

# Database engine
engine = create_async_engine(
    settings.database_url,
    pool_size=settings.database_pool_size,
    max_overflow=settings.database_max_overflow,
    echo=settings.debug,
)

# Session maker
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Redis connection pool
redis_pool = None


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_redis():
    """Get Redis connection"""
    global redis_pool
    if redis_pool is None:
        redis_pool = await aioredis.from_url(
            settings.redis_url, encoding="utf-8", decode_responses=True
        )
    return redis_pool


async def close_redis():
    """Close Redis connection"""
    global redis_pool
    if redis_pool:
        await redis_pool.close()
        redis_pool = None
