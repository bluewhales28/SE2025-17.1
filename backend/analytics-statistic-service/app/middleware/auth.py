"""
JWT Authentication Middleware
"""
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Optional
from jose import JWTError, jwt

from app.config import settings


security = HTTPBearer()


class AuthMiddleware(BaseHTTPMiddleware):
    """Middleware for JWT authentication"""
    
    # Paths that don't require authentication
    EXEMPT_PATHS = [
        "/",
        "/health",
        "/docs",
        "/redoc",
        "/openapi.json"
    ]
    
    async def dispatch(self, request: Request, call_next):
        """Process request and verify JWT token"""
        
        # Skip authentication for exempt paths
        if request.url.path in self.EXEMPT_PATHS:
            return await call_next(request)
        
        # Get authorization header
        auth_header = request.headers.get("Authorization")
        
        if not auth_header:
            # Allow request to proceed, but without user info
            # API endpoints will handle authorization checks
            return await call_next(request)
        
        try:
            # Extract token
            scheme, token = auth_header.split()
            if scheme.lower() != "bearer":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication scheme"
                )
            
            # Verify token
            payload = verify_token(token)
            
            # Add user info to request state
            request.state.user_id = payload.get("user_id")
            request.state.email = payload.get("email")
            request.state.role = payload.get("role", "student")
            request.state.authenticated = True
            
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header format"
            )
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        except Exception as e:
            print(f"Auth error: {e}")
            request.state.authenticated = False
        
        response = await call_next(request)
        return response


def verify_token(token: str) -> dict:
    """
    Verify JWT token
    
    Args:
        token: JWT token string
    
    Returns:
        Decoded payload
    
    Raises:
        JWTError: If token is invalid
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError as e:
        raise JWTError(f"Token verification failed: {e}")


def get_current_user(request: Request) -> Optional[dict]:
    """
    Get current authenticated user from request
    
    Args:
        request: FastAPI request object
    
    Returns:
        User info dict or None
    """
    if not hasattr(request.state, "authenticated") or not request.state.authenticated:
        return None
    
    return {
        "user_id": getattr(request.state, "user_id", None),
        "email": getattr(request.state, "email", None),
        "role": getattr(request.state, "role", "student")
    }


def require_role(required_role: str):
    """
    Decorator to require specific role
    
    Args:
        required_role: Required role (e.g., "teacher", "admin")
    """
    def decorator(func):
        async def wrapper(request: Request, *args, **kwargs):
            user = get_current_user(request)
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            if user["role"] not in ["admin", required_role]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )
            
            return await func(request, *args, **kwargs)
        
        return wrapper
    return decorator


