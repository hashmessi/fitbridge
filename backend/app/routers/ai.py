"""
AI Service Router
Central AI operations endpoint
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from app.services.ai_service import AIService
from app.config import get_settings

router = APIRouter()


class GeneratePlanRequest(BaseModel):
    """Request model for AI plan generation"""
    user_description: str
    plan_type: str  # 'workout' or 'diet'
    user_profile: Optional[dict] = None


class GeneratePlanResponse(BaseModel):
    """Response model for generated plans"""
    success: bool
    plan: Optional[dict] = None
    error: Optional[str] = None


def get_ai_service() -> AIService:
    """Dependency to get AI service instance"""
    settings = get_settings()
    return AIService(settings)


@router.post("/generate", response_model=GeneratePlanResponse)
async def generate_plan(
    request: GeneratePlanRequest,
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Generate an AI workout or diet plan based on user description
    """
    try:
        if request.plan_type == "workout":
            plan = await ai_service.generate_workout_plan(
                request.user_description,
                request.user_profile
            )
        elif request.plan_type == "diet":
            plan = await ai_service.generate_diet_plan(
                request.user_description,
                request.user_profile
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid plan_type. Must be 'workout' or 'diet'"
            )
        
        return GeneratePlanResponse(success=True, plan=plan)
    
    except Exception as e:
        return GeneratePlanResponse(success=False, error=str(e))


@router.get("/status")
async def ai_status(ai_service: AIService = Depends(get_ai_service)):
    """Check AI service status and provider info"""
    settings = get_settings()
    return {
        "provider": settings.ai_provider,
        "model": settings.openai_model if settings.ai_provider == "openai" else "deepseek-chat",
        "ready": ai_service.is_ready()
    }
