from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core import config

security = HTTPBearer(auto_error=True)


def verify_token(credentials=Depends(security)):
    token = credentials.credentials
    print("RAW TOKEN:", token)

    try:
        payload = jwt.decode(
            token,
            config.JWT_SECRET,
            algorithms=["HS512"],
            options={"verify_aud": False}
        )
        print("JWT PAYLOAD:", payload)
        return payload

    except JWTError as e:
        print("JWT ERROR >>>", repr(e))
        raise HTTPException(status_code=401, detail="Invalid token")


# ✅ Quyền xem báo cáo (teacher / admin)
def teacher_or_admin(user=Depends(verify_token)):
    scope = user.get("scope", "")

    # Token của bạn: "user:read quiz:write"
    allowed_scopes = [
        "quiz:write",
        "quiz:read",
        "report:read"
    ]

    if not any(s in scope for s in allowed_scopes):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied"
        )

    return user
