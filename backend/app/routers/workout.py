"""
Workout Router
Endpoints for workout logging and retrieval
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import date

from app.services.supabase_service import SupabaseService
from app.dependencies.auth import get_current_user
from app.config import get_settings

router = APIRouter()


class WorkoutLogCreate(BaseModel):
    """Create workout log request"""
    title: str
    workout_type: Optional[str] = None
    duration_minutes: int
    calories_burned: Optional[int] = None
    exercises: Optional[List[dict]] = None
    notes: Optional[str] = None
    is_ai_generated: bool = False
    workout_date: Optional[str] = None  # ISO date string


class WorkoutLogResponse(BaseModel):
    """Workout log response"""
    id: str
    title: str
    workout_type: Optional[str]
    duration_minutes: int
    calories_burned: Optional[int]
    exercises: Optional[List[dict]]
    workout_date: str
    created_at: str


def get_supabase_service() -> SupabaseService:
    """Dependency to get Supabase service"""
    settings = get_settings()
    return SupabaseService(settings)





@router.post("/log")
async def create_workout_log(
    workout: WorkoutLogCreate,
    current_user=Depends(get_current_user),
    db: SupabaseService = Depends(get_supabase_service)
):
    """Log a new workout session"""
    try:
        user_id = current_user.id
        workout_date = workout.workout_date or date.today().isoformat()
        
        result = await db.create_workout_log(
            user_id=user_id,
            title=workout.title,
            workout_type=workout.workout_type,
            duration_minutes=workout.duration_minutes,
            calories_burned=workout.calories_burned,
            exercises=workout.exercises,
            notes=workout.notes,
            is_ai_generated=workout.is_ai_generated,
            workout_date=workout_date
        )
        
        # Update daily log
        await db.update_daily_log(
            user_id=user_id,
            log_date=workout_date,
            workout_completed=True,
            calories_burned_add=workout.calories_burned or 0
        )
        
        return {"success": True, "data": result}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/logs")
async def get_workout_logs(
    limit: int = 10,
    offset: int = 0,
    current_user=Depends(get_current_user),
    db: SupabaseService = Depends(get_supabase_service)
):
    """Get user's workout logs with pagination"""
    try:
        user_id = current_user.id
        logs = await db.get_workout_logs(user_id, limit, offset)
        return {"success": True, "data": logs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/logs/{workout_id}")
async def get_workout_log(
    workout_id: str,
    current_user=Depends(get_current_user),
    db: SupabaseService = Depends(get_supabase_service)
):
    """Get a specific workout log"""
    try:
        user_id = current_user.id
        log = await db.get_workout_log(user_id, workout_id)
        if not log:
            raise HTTPException(status_code=404, detail="Workout not found")
        return {"success": True, "data": log}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/logs/{workout_id}")
async def delete_workout_log(
    workout_id: str,
    current_user=Depends(get_current_user),
    db: SupabaseService = Depends(get_supabase_service)
):
    """Delete a workout log"""
    try:
        user_id = current_user.id
        await db.delete_workout_log(user_id, workout_id)
        return {"success": True, "message": "Workout deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_workout_stats(
    days: int = 7,
    current_user=Depends(get_current_user),
    db: SupabaseService = Depends(get_supabase_service)
):
    """Get workout statistics for the specified period"""
    try:
        user_id = current_user.id
        stats = await db.get_workout_stats(user_id, days)
        return {"success": True, "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
