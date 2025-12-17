"""
Health Check Router
Simple endpoints to verify API status
"""

from fastapi import APIRouter
from datetime import datetime

from app.config import get_settings

router = APIRouter()


@router.get("/health")
async def health_check():
    """Check if the API is healthy and running"""
    settings = get_settings()
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "ai_provider": settings.ai_provider,
        "supabase_connected": bool(settings.supabase_url)
    }


@router.get("/ping")
async def ping():
    """Simple ping endpoint for quick checks"""
    return {"pong": True}
