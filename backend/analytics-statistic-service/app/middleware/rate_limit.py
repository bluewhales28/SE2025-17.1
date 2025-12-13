"""
Rate Limiting Middleware
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict

from fastapi import HTTPException, Request, status
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from app.dependencies import get_redis


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware for rate limiting requests"""

    def __init__(self, app):
        super().__init__(app)
        self.requests_limit = settings.rate_limit_requests
        self.time_window = settings.rate_limit_period  # seconds
        self.enabled = settings.rate_limit_enabled

    async def dispatch(self, request: Request, call_next):
        """Process request with rate limiting"""

        if not self.enabled:
            return await call_next(request)

        # Get client identifier (IP address)
        client_ip = request.client.host

        # Check rate limit
        if await self._is_rate_limited(client_ip, request.url.path):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )

        response = await call_next(request)
        return response

    async def _is_rate_limited(self, client_ip: str, path: str) -> bool:
        """
        Check if client has exceeded rate limit

        Args:
            client_ip: Client IP address
            path: Request path

        Returns:
            True if rate limited, False otherwise
        """
        try:
            redis = await get_redis()
            key = f"rate_limit:{client_ip}:{path}"

            # Get current count
            current = await redis.get(key)

            if current is None:
                # First request, set counter
                await redis.setex(key, self.time_window, 1)
                return False

            current_count = int(current)

            if current_count >= self.requests_limit:
                return True

            # Increment counter
            await redis.incr(key)
            return False

        except Exception as e:
            print(f"Rate limit check error: {e}")
            # On error, allow the request
            return False
