"""
Diet Router
Endpoints for meal logging and nutrition tracking
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import date

from app.services.supabase_service import SupabaseService
from app.config import get_settings

router = APIRouter()


class MealLogCreate(BaseModel):
    """Create meal log request"""
    meal_type: str  # 'Breakfast', 'Lunch', 'Dinner', 'Snack'
    meal_name: str
    calories: int
    protein: Optional[float] = 0
    carbs: Optional[float] = 0
    fats: Optional[float] = 0
    description: Optional[str] = None
    is_ai_generated: bool = False
    log_date: Optional[str] = None  # ISO date string


class MealLogResponse(BaseModel):
    """Meal log response"""
    id: str
    meal_type: str
    meal_name: str
    calories: int
    protein: float
    carbs: float
    fats: float
    log_date: str
    created_at: str


def get_supabase_service() -> SupabaseService:
    """Dependency to get Supabase service"""
    settings = get_settings()
    return SupabaseService(settings)


async def get_user_id(authorization: str = Header(...)) -> str:
    """Extract user ID from authorization header"""
    if authorization.startswith("Bearer "):
        return authorization[7:]
    return authorization


@router.post("/log")
async def create_meal_log(
    meal: MealLogCreate,
    user_id: str = Depends(get_user_id),
    db: SupabaseService = Depends(get_supabase_service)
):
    """Log a new meal"""
    try:
        log_date = meal.log_date or date.today().isoformat()
        
        result = await db.create_diet_log(
            user_id=user_id,
            meal_type=meal.meal_type,
            meal_name=meal.meal_name,
            calories=meal.calories,
            protein=meal.protein,
            carbs=meal.carbs,
            fats=meal.fats,
            description=meal.description,
            is_ai_generated=meal.is_ai_generated,
            log_date=log_date
        )
        
        # Update daily log with calories consumed
        await db.update_daily_log(
            user_id=user_id,
            log_date=log_date,
            calories_consumed_add=meal.calories
        )
        
        return {"success": True, "data": result}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/logs")
async def get_meal_logs(
    limit: int = 20,
    offset: int = 0,
    log_date: Optional[str] = None,
    user_id: str = Depends(get_user_id),
    db: SupabaseService = Depends(get_supabase_service)
):
    """Get user's meal logs with optional date filter"""
    try:
        logs = await db.get_diet_logs(user_id, limit, offset, log_date)
        return {"success": True, "data": logs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/logs/today")
async def get_today_meals(
    user_id: str = Depends(get_user_id),
    db: SupabaseService = Depends(get_supabase_service)
):
    """Get today's meals with summary"""
    try:
        today = date.today().isoformat()
        logs = await db.get_diet_logs(user_id, limit=20, log_date=today)
        
        # Calculate totals
        total_calories = sum(log.get('calories', 0) for log in logs)
        total_protein = sum(log.get('protein', 0) for log in logs)
        total_carbs = sum(log.get('carbs', 0) for log in logs)
        total_fats = sum(log.get('fats', 0) for log in logs)
        
        return {
            "success": True,
            "data": {
                "meals": logs,
                "totals": {
                    "calories": total_calories,
                    "protein": total_protein,
                    "carbs": total_carbs,
                    "fats": total_fats
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/logs/{meal_id}")
async def delete_meal_log(
    meal_id: str,
    user_id: str = Depends(get_user_id),
    db: SupabaseService = Depends(get_supabase_service)
):
    """Delete a meal log"""
    try:
        await db.delete_diet_log(user_id, meal_id)
        return {"success": True, "message": "Meal deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_diet_stats(
    days: int = 7,
    user_id: str = Depends(get_user_id),
    db: SupabaseService = Depends(get_supabase_service)
):
    """Get nutrition statistics for the specified period"""
    try:
        stats = await db.get_diet_stats(user_id, days)
        return {"success": True, "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
