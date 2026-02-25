"""
Auth Dependency
Verifies Supabase JWT tokens and extracts the authenticated user.
"""

from fastapi import Header, HTTPException
from supabase import create_client
from app.config import get_settings

settings = get_settings()
supabase = create_client(settings.supabase_url, settings.supabase_anon_key)


async def get_current_user(authorization: str = Header(None)):
    """
    Verify the Bearer JWT token with Supabase and return the authenticated user.
    Raises 401 if token is missing, invalid, or expired.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    token = authorization.replace("Bearer ", "")

    try:
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user.user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Token validation failed")
