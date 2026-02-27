"""Supabase Service

Handles all database operations with Supabase.

Important:
- The backend must never silently fall back to in-memory storage.
- If Supabase isn't configured or the client can't be created, we fail fast.

This fixes production issues where data appeared to persist (in memory) but the
database remained empty.
"""

from __future__ import annotations

from typing import Optional, List, Dict, Any
from datetime import date, datetime, timedelta
import uuid

from fastapi.concurrency import run_in_threadpool

from app.config import Settings


class SupabaseService:
    """Service for Supabase database operations."""

    def __init__(self, settings: Settings):
        self.settings = settings

        if not (settings.supabase_url and settings.supabase_service_role_key):
            raise RuntimeError(
                "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
            )

        try:
            from supabase import create_client

            # Backend must use service_role for writes.
            self.client = create_client(settings.supabase_url, settings.supabase_service_role_key)
        except Exception as e:
            raise RuntimeError(f"Failed to initialize Supabase client: {e}") from e

    async def _execute(self, fn, *, op: str) -> Any:
        """Run a synchronous Supabase operation in a threadpool and validate errors."""
        response = await run_in_threadpool(fn)

        # supabase-py returns an APIResponse with `.data` and `.error`.
        if hasattr(response, "error") and response.error:
            msg = getattr(response.error, "message", None) or str(response.error)
            raise RuntimeError(f"Supabase {op} failed: {msg}")

        return response
    
    # ==========================================
    # USER OPERATIONS
    # ==========================================
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """Get user profile by ID"""
        response = await self._execute(
            lambda: self.client.table("users").select("*").eq("id", user_id).single().execute(),
            op="select users profile",
        )
        return response.data
    
    async def update_user_profile(self, user_id: str, data: Dict) -> Dict:
        """Update user profile"""
        response = await self._execute(
            lambda: self.client.table("users").update(data).eq("id", user_id).execute(),
            op="update users profile",
        )
        if not response.data:
            raise RuntimeError("Update returned no data")
        return response.data[0]
    
    # ==========================================
    # WORKOUT LOG OPERATIONS
    # ==========================================
    
    async def create_workout_log(
        self,
        user_id: str,
        title: str,
        duration_minutes: int,
        workout_type: Optional[str] = None,
        calories_burned: Optional[int] = None,
        exercises: Optional[List[Dict]] = None,
        notes: Optional[str] = None,
        is_ai_generated: bool = False,
        workout_date: Optional[str] = None
    ) -> Dict:
        """Create a new workout log entry"""
        if not user_id:
            raise ValueError("user_id is required")

        log_data = {
            'id': str(uuid.uuid4()),
            'user_id': user_id,
            'title': title,
            'workout_type': workout_type,
            'duration_minutes': duration_minutes,
            'calories_burned': calories_burned,
            'exercises': exercises,
            'notes': notes,
            'is_ai_generated': is_ai_generated,
            'workout_date': workout_date or date.today().isoformat(),
            'created_at': datetime.now().isoformat()
        }
        
        response = await self._execute(
            lambda: self.client.table("workout_logs").insert(log_data).execute(),
            op="insert workout_logs",
        )
        if not response.data:
            raise RuntimeError("Insert returned no data")

        new_row = response.data[0]
        verify = await self._execute(
            lambda: self.client.table("workout_logs").select("*").eq("id", new_row["id"]).single().execute(),
            op="verify insert workout_logs",
        )
        if not verify.data:
            raise RuntimeError("Write not persisted")

        return new_row
    
    async def get_workout_logs(
        self,
        user_id: str,
        limit: int = 10,
        offset: int = 0
    ) -> List[Dict]:
        """Get workout logs for a user with pagination"""
        response = await self._execute(
            lambda: (
                self.client.table("workout_logs")
                .select("*")
                .eq("user_id", user_id)
                .order("workout_date", desc=True)
                .limit(limit)
                .offset(offset)
                .execute()
            ),
            op="select workout_logs",
        )
        return response.data or []
    
    async def get_workout_log(self, user_id: str, workout_id: str) -> Optional[Dict]:
        """Get a specific workout log"""
        response = await self._execute(
            lambda: (
                self.client.table("workout_logs")
                .select("*")
                .eq("user_id", user_id)
                .eq("id", workout_id)
                .single()
                .execute()
            ),
            op="select workout_log",
        )
        return response.data
    
    async def delete_workout_log(self, user_id: str, workout_id: str) -> bool:
        """Delete a workout log"""
        await self._execute(
            lambda: (
                self.client.table("workout_logs")
                .delete()
                .eq("user_id", user_id)
                .eq("id", workout_id)
                .execute()
            ),
            op="delete workout_logs",
        )
        return True
    
    async def get_workout_stats(self, user_id: str, days: int = 7) -> Dict:
        """Get workout statistics for the specified period"""
        start_date = (date.today() - timedelta(days=days)).isoformat()
        
        response = await self._execute(
            lambda: (
                self.client.table("workout_logs")
                .select("*")
                .eq("user_id", user_id)
                .gte("workout_date", start_date)
                .execute()
            ),
            op="select workout_logs stats",
        )

        logs = response.data or []

        return {
            "total_workouts": len(logs),
            "total_duration_minutes": sum(log.get("duration_minutes", 0) for log in logs),
            "total_calories_burned": sum(log.get("calories_burned", 0) or 0 for log in logs),
            "workout_days": len(set(log.get("workout_date") for log in logs)),
            "period_days": days,
        }
    
    # ==========================================
    # DIET LOG OPERATIONS
    # ==========================================
    
    async def create_diet_log(
        self,
        user_id: str,
        meal_type: str,
        meal_name: str,
        calories: int,
        protein: float = 0,
        carbs: float = 0,
        fats: float = 0,
        description: Optional[str] = None,
        is_ai_generated: bool = False,
        log_date: Optional[str] = None
    ) -> Dict:
        """Create a new diet log entry"""
        if not user_id:
            raise ValueError("user_id is required")

        log_data = {
            'id': str(uuid.uuid4()),
            'user_id': user_id,
            'meal_type': meal_type,
            'meal_name': meal_name,
            'calories': calories,
            'protein': protein,
            'carbs': carbs,
            'fats': fats,
            'description': description,
            'is_ai_generated': is_ai_generated,
            'log_date': log_date or date.today().isoformat(),
            'created_at': datetime.now().isoformat()
        }
        
        response = await self._execute(
            lambda: self.client.table("diet_logs").insert(log_data).execute(),
            op="insert diet_logs",
        )
        if not response.data:
            raise RuntimeError("Insert returned no data")

        new_row = response.data[0]
        verify = await self._execute(
            lambda: self.client.table("diet_logs").select("*").eq("id", new_row["id"]).single().execute(),
            op="verify insert diet_logs",
        )
        if not verify.data:
            raise RuntimeError("Write not persisted")

        return new_row
    
    async def get_diet_logs(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
        log_date: Optional[str] = None
    ) -> List[Dict]:
        """Get diet logs for a user with optional date filter"""
        query = self.client.table("diet_logs").select("*").eq("user_id", user_id)

        if log_date:
            query = query.eq("log_date", log_date)

        response = await self._execute(
            lambda: (
                query.order("created_at", desc=True)
                .limit(limit)
                .offset(offset)
                .execute()
            ),
            op="select diet_logs",
        )
        return response.data or []
    
    async def delete_diet_log(self, user_id: str, meal_id: str) -> bool:
        """Delete a diet log"""
        await self._execute(
            lambda: (
                self.client.table("diet_logs")
                .delete()
                .eq("user_id", user_id)
                .eq("id", meal_id)
                .execute()
            ),
            op="delete diet_logs",
        )
        return True
    
    async def get_diet_stats(self, user_id: str, days: int = 7) -> Dict:
        """Get diet statistics for the specified period"""
        start_date = (date.today() - timedelta(days=days)).isoformat()
        
        response = await self._execute(
            lambda: (
                self.client.table("diet_logs")
                .select("*")
                .eq("user_id", user_id)
                .gte("log_date", start_date)
                .execute()
            ),
            op="select diet_logs stats",
        )

        logs = response.data or []
        total_calories = sum(log.get("calories", 0) for log in logs)

        return {
            "total_meals": len(logs),
            "total_calories": total_calories,
            "total_protein": sum(log.get("protein", 0) or 0 for log in logs),
            "total_carbs": sum(log.get("carbs", 0) or 0 for log in logs),
            "total_fats": sum(log.get("fats", 0) or 0 for log in logs),
            "avg_daily_calories": total_calories // max(days, 1),
            "period_days": days,
        }
    
    # ==========================================
    # DAILY LOG OPERATIONS
    # ==========================================
    
    async def update_daily_log(
        self,
        user_id: str,
        log_date: str,
        calories_consumed_add: int = 0,
        calories_burned_add: int = 0,
        steps_add: int = 0,
        workout_completed: Optional[bool] = None
    ) -> Dict:
        """Update or create daily log entry"""
        key = f"{user_id}_{log_date}"
        
        response = await self._execute(
            lambda: (
                self.client.table("daily_logs")
                .select("*")
                .eq("user_id", user_id)
                .eq("log_date", log_date)
                .execute()
            ),
            op="select daily_logs existing",
        )

        if response.data:
            existing = response.data[0]
            update_data = {
                "calories_consumed": existing.get("calories_consumed", 0) + calories_consumed_add,
                "calories_burned": existing.get("calories_burned", 0) + calories_burned_add,
                "steps": existing.get("steps", 0) + steps_add,
            }
            if workout_completed is not None:
                update_data["workout_completed"] = workout_completed

            result = await self._execute(
                lambda: (
                    self.client.table("daily_logs")
                    .update(update_data)
                    .eq("id", existing["id"])
                    .execute()
                ),
                op="update daily_logs",
            )
            if not result.data:
                raise RuntimeError("Update returned no data")
            return result.data[0]

        data = {
            "user_id": user_id,
            "log_date": log_date,
            "calories_consumed": calories_consumed_add,
            "calories_burned": calories_burned_add,
            "steps": steps_add,
            "workout_completed": bool(workout_completed) if workout_completed is not None else False,
        }
        result = await self._execute(
            lambda: self.client.table("daily_logs").insert(data).execute(),
            op="insert daily_logs",
        )
        if not result.data:
            raise RuntimeError("Insert returned no data")
        return result.data[0]
    
    async def get_daily_logs(
        self,
        user_id: str,
        days: int = 7
    ) -> List[Dict]:
        """Get daily logs for the specified period"""
        start_date = (date.today() - timedelta(days=days)).isoformat()
        
        response = await self._execute(
            lambda: (
                self.client.table("daily_logs")
                .select("*")
                .eq("user_id", user_id)
                .gte("log_date", start_date)
                .order("log_date", desc=True)
                .execute()
            ),
            op="select daily_logs",
        )
        return response.data or []
    
    # ==========================================
    # STREAKS OPERATIONS
    # ==========================================
    
    async def get_user_streaks(self, user_id: str) -> List[Dict]:
        """Get all streaks for a user"""
        response = await self._execute(
            lambda: self.client.table("streaks").select("*").eq("user_id", user_id).execute(),
            op="select streaks",
        )
        return response.data or []
    
    async def update_streak(
        self,
        user_id: str,
        streak_type: str,
        increment: bool = True
    ) -> Dict:
        """Update a specific streak"""
        response = await self._execute(
            lambda: (
                self.client.table("streaks")
                .select("*")
                .eq("user_id", user_id)
                .eq("streak_type", streak_type)
                .single()
                .execute()
            ),
            op="select streak",
        )

        if response.data:
            streak = response.data
            today = date.today().isoformat()

            new_streak = streak["current_streak"] + 1 if increment else 0

            update_data = {
                "current_streak": new_streak,
                "longest_streak": max(streak["longest_streak"], new_streak),
                "last_activity_date": today,
                "xp_earned": streak["xp_earned"] + (10 if increment else 0),
            }

            result = await self._execute(
                lambda: (
                    self.client.table("streaks")
                    .update(update_data)
                    .eq("id", streak["id"])
                    .execute()
                ),
                op="update streak",
            )
            if not result.data:
                raise RuntimeError("Update returned no data")
            return result.data[0]

        return None
    
    # ==========================================
    # AI PLANS OPERATIONS
    # ==========================================
    
    async def save_ai_plan(
        self,
        user_id: str,
        plan_type: str,
        title: str,
        plan_data: Dict,
        prompt_used: str,
        generated_by: str = "openai"
    ) -> Dict:
        """Save an AI-generated plan"""
        if not user_id:
            raise ValueError("user_id is required")

        plan = {
            'id': str(uuid.uuid4()),
            'user_id': user_id,
            'plan_type': plan_type,
            'title': title,
            'plan_data': plan_data,
            'prompt_used': prompt_used,
            'generated_by': generated_by,
            'is_active': True,
            'created_at': datetime.now().isoformat()
        }
        
        response = await self._execute(
            lambda: self.client.table("ai_plans").insert(plan).execute(),
            op="insert ai_plans",
        )
        if not response.data:
            raise RuntimeError("Insert returned no data")
        return response.data[0]
    
    async def get_active_plans(self, user_id: str) -> List[Dict]:
        """Get active AI plans for a user"""
        response = await self._execute(
            lambda: (
                self.client.table("ai_plans")
                .select("*")
                .eq("user_id", user_id)
                .eq("is_active", True)
                .order("created_at", desc=True)
                .execute()
            ),
            op="select ai_plans",
        )
        return response.data or []
    
    async def deactivate_plan(self, user_id: str, plan_id: str) -> bool:
        """Deactivate an AI plan"""
        await self._execute(
            lambda: (
                self.client.table("ai_plans")
                .update({"is_active": False})
                .eq("user_id", user_id)
                .eq("id", plan_id)
                .execute()
            ),
            op="update ai_plans deactivate",
        )
        return True
