"""
Supabase Service
Handles all database operations with Supabase or in-memory mock storage
"""

from typing import Optional, List, Dict, Any
from datetime import date, datetime, timedelta
import uuid

from app.config import Settings


class SupabaseService:
    """Service for Supabase database operations (with mock mode support)"""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.is_mock = not bool(settings.supabase_url and settings.supabase_service_role_key)
        self.client = None
        
        if not self.is_mock:
            try:
                from supabase import create_client
                self.client = create_client(
                    settings.supabase_url,
                    settings.supabase_service_role_key
                )
            except Exception as e:
                print(f"Failed to connect to Supabase: {e}")
                self.is_mock = True
        
        # Mock storage
        self._mock_data = {
            'users': {},
            'workout_logs': [],
            'diet_logs': [],
            'daily_logs': {},
            'streaks': {},
            'ai_plans': [],
            'weight_history': []
        }
    
    # ==========================================
    # USER OPERATIONS
    # ==========================================
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """Get user profile by ID"""
        if self.is_mock:
            return self._mock_data['users'].get(user_id, {
                'id': user_id,
                'name': 'Demo User',
                'email': 'demo@fitbridge.app',
                'weight': 75,
                'height': 175,
                'goal': 'Muscle Gain',
                'fitness_level': 'Intermediate'
            })
        
        response = self.client.table('users').select('*').eq('id', user_id).single().execute()
        return response.data
    
    async def update_user_profile(self, user_id: str, data: Dict) -> Dict:
        """Update user profile"""
        if self.is_mock:
            self._mock_data['users'][user_id] = {**self._mock_data['users'].get(user_id, {}), **data}
            return self._mock_data['users'][user_id]
        
        response = self.client.table('users').update(data).eq('id', user_id).execute()
        return response.data[0] if response.data else None
    
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
        
        if self.is_mock:
            self._mock_data['workout_logs'].append(log_data)
            return log_data
        
        response = self.client.table('workout_logs').insert(log_data).execute()
        return response.data[0] if response.data else None
    
    async def get_workout_logs(
        self,
        user_id: str,
        limit: int = 10,
        offset: int = 0
    ) -> List[Dict]:
        """Get workout logs for a user with pagination"""
        if self.is_mock:
            logs = [l for l in self._mock_data['workout_logs'] if l['user_id'] == user_id]
            logs.sort(key=lambda x: x['workout_date'], reverse=True)
            return logs[offset:offset + limit]
        
        response = (
            self.client.table('workout_logs')
            .select('*')
            .eq('user_id', user_id)
            .order('workout_date', desc=True)
            .limit(limit)
            .offset(offset)
            .execute()
        )
        return response.data or []
    
    async def get_workout_log(self, user_id: str, workout_id: str) -> Optional[Dict]:
        """Get a specific workout log"""
        if self.is_mock:
            for log in self._mock_data['workout_logs']:
                if log['id'] == workout_id and log['user_id'] == user_id:
                    return log
            return None
        
        response = (
            self.client.table('workout_logs')
            .select('*')
            .eq('user_id', user_id)
            .eq('id', workout_id)
            .single()
            .execute()
        )
        return response.data
    
    async def delete_workout_log(self, user_id: str, workout_id: str) -> bool:
        """Delete a workout log"""
        if self.is_mock:
            self._mock_data['workout_logs'] = [
                l for l in self._mock_data['workout_logs'] 
                if not (l['id'] == workout_id and l['user_id'] == user_id)
            ]
            return True
        
        self.client.table('workout_logs').delete().eq('user_id', user_id).eq('id', workout_id).execute()
        return True
    
    async def get_workout_stats(self, user_id: str, days: int = 7) -> Dict:
        """Get workout statistics for the specified period"""
        start_date = (date.today() - timedelta(days=days)).isoformat()
        
        if self.is_mock:
            logs = [
                l for l in self._mock_data['workout_logs'] 
                if l['user_id'] == user_id and l['workout_date'] >= start_date
            ]
            return {
                'total_workouts': len(logs),
                'total_duration_minutes': sum(l.get('duration_minutes', 0) for l in logs),
                'total_calories_burned': sum(l.get('calories_burned', 0) or 0 for l in logs),
                'workout_days': len(set(l.get('workout_date') for l in logs)),
                'period_days': days
            }
        
        response = (
            self.client.table('workout_logs')
            .select('*')
            .eq('user_id', user_id)
            .gte('workout_date', start_date)
            .execute()
        )
        
        logs = response.data or []
        
        return {
            'total_workouts': len(logs),
            'total_duration_minutes': sum(log.get('duration_minutes', 0) for log in logs),
            'total_calories_burned': sum(log.get('calories_burned', 0) or 0 for log in logs),
            'workout_days': len(set(log.get('workout_date') for log in logs)),
            'period_days': days
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
        
        if self.is_mock:
            self._mock_data['diet_logs'].append(log_data)
            return log_data
        
        response = self.client.table('diet_logs').insert(log_data).execute()
        return response.data[0] if response.data else None
    
    async def get_diet_logs(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
        log_date: Optional[str] = None
    ) -> List[Dict]:
        """Get diet logs for a user with optional date filter"""
        if self.is_mock:
            logs = [l for l in self._mock_data['diet_logs'] if l['user_id'] == user_id]
            if log_date:
                logs = [l for l in logs if l['log_date'] == log_date]
            logs.sort(key=lambda x: x['created_at'], reverse=True)
            return logs[offset:offset + limit]
        
        query = (
            self.client.table('diet_logs')
            .select('*')
            .eq('user_id', user_id)
        )
        
        if log_date:
            query = query.eq('log_date', log_date)
        
        response = (
            query
            .order('created_at', desc=True)
            .limit(limit)
            .offset(offset)
            .execute()
        )
        return response.data or []
    
    async def delete_diet_log(self, user_id: str, meal_id: str) -> bool:
        """Delete a diet log"""
        if self.is_mock:
            self._mock_data['diet_logs'] = [
                l for l in self._mock_data['diet_logs'] 
                if not (l['id'] == meal_id and l['user_id'] == user_id)
            ]
            return True
        
        self.client.table('diet_logs').delete().eq('user_id', user_id).eq('id', meal_id).execute()
        return True
    
    async def get_diet_stats(self, user_id: str, days: int = 7) -> Dict:
        """Get diet statistics for the specified period"""
        start_date = (date.today() - timedelta(days=days)).isoformat()
        
        if self.is_mock:
            logs = [
                l for l in self._mock_data['diet_logs'] 
                if l['user_id'] == user_id and l['log_date'] >= start_date
            ]
            total_calories = sum(l.get('calories', 0) for l in logs)
            return {
                'total_meals': len(logs),
                'total_calories': total_calories,
                'total_protein': sum(l.get('protein', 0) or 0 for l in logs),
                'total_carbs': sum(l.get('carbs', 0) or 0 for l in logs),
                'total_fats': sum(l.get('fats', 0) or 0 for l in logs),
                'avg_daily_calories': total_calories // max(days, 1),
                'period_days': days
            }
        
        response = (
            self.client.table('diet_logs')
            .select('*')
            .eq('user_id', user_id)
            .gte('log_date', start_date)
            .execute()
        )
        
        logs = response.data or []
        total_calories = sum(log.get('calories', 0) for log in logs)
        
        return {
            'total_meals': len(logs),
            'total_calories': total_calories,
            'total_protein': sum(log.get('protein', 0) or 0 for log in logs),
            'total_carbs': sum(log.get('carbs', 0) or 0 for log in logs),
            'total_fats': sum(log.get('fats', 0) or 0 for log in logs),
            'avg_daily_calories': total_calories // max(days, 1),
            'period_days': days
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
        
        if self.is_mock:
            existing = self._mock_data['daily_logs'].get(key, {
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'log_date': log_date,
                'calories_consumed': 0,
                'calories_burned': 0,
                'steps': 0,
                'workout_completed': False
            })
            
            existing['calories_consumed'] = existing.get('calories_consumed', 0) + calories_consumed_add
            existing['calories_burned'] = existing.get('calories_burned', 0) + calories_burned_add
            existing['steps'] = existing.get('steps', 0) + steps_add
            if workout_completed is not None:
                existing['workout_completed'] = workout_completed
            
            self._mock_data['daily_logs'][key] = existing
            return existing
        
        # Try to get existing log
        response = (
            self.client.table('daily_logs')
            .select('*')
            .eq('user_id', user_id)
            .eq('log_date', log_date)
            .execute()
        )
        
        if response.data:
            # Update existing
            existing = response.data[0]
            update_data = {
                'calories_consumed': existing.get('calories_consumed', 0) + calories_consumed_add,
                'calories_burned': existing.get('calories_burned', 0) + calories_burned_add,
                'steps': existing.get('steps', 0) + steps_add,
            }
            if workout_completed is not None:
                update_data['workout_completed'] = workout_completed
            
            result = (
                self.client.table('daily_logs')
                .update(update_data)
                .eq('id', existing['id'])
                .execute()
            )
            return result.data[0] if result.data else None
        else:
            # Create new
            data = {
                'user_id': user_id,
                'log_date': log_date,
                'calories_consumed': calories_consumed_add,
                'calories_burned': calories_burned_add,
                'steps': steps_add,
                'workout_completed': workout_completed or False
            }
            result = self.client.table('daily_logs').insert(data).execute()
            return result.data[0] if result.data else None
    
    async def get_daily_logs(
        self,
        user_id: str,
        days: int = 7
    ) -> List[Dict]:
        """Get daily logs for the specified period"""
        start_date = (date.today() - timedelta(days=days)).isoformat()
        
        if self.is_mock:
            logs = [
                v for k, v in self._mock_data['daily_logs'].items() 
                if k.startswith(user_id) and v['log_date'] >= start_date
            ]
            logs.sort(key=lambda x: x['log_date'], reverse=True)
            return logs
        
        response = (
            self.client.table('daily_logs')
            .select('*')
            .eq('user_id', user_id)
            .gte('log_date', start_date)
            .order('log_date', desc=True)
            .execute()
        )
        return response.data or []
    
    # ==========================================
    # STREAKS OPERATIONS
    # ==========================================
    
    async def get_user_streaks(self, user_id: str) -> List[Dict]:
        """Get all streaks for a user"""
        if self.is_mock:
            if user_id not in self._mock_data['streaks']:
                self._mock_data['streaks'][user_id] = [
                    {'streak_type': 'workout', 'current_streak': 5, 'longest_streak': 12, 'xp_earned': 250},
                    {'streak_type': 'diet', 'current_streak': 3, 'longest_streak': 7, 'xp_earned': 150},
                    {'streak_type': 'login', 'current_streak': 10, 'longest_streak': 15, 'xp_earned': 100},
                    {'streak_type': 'steps', 'current_streak': 2, 'longest_streak': 5, 'xp_earned': 50}
                ]
            return self._mock_data['streaks'][user_id]
        
        response = (
            self.client.table('streaks')
            .select('*')
            .eq('user_id', user_id)
            .execute()
        )
        return response.data or []
    
    async def update_streak(
        self,
        user_id: str,
        streak_type: str,
        increment: bool = True
    ) -> Dict:
        """Update a specific streak"""
        if self.is_mock:
            streaks = await self.get_user_streaks(user_id)
            for streak in streaks:
                if streak['streak_type'] == streak_type:
                    if increment:
                        streak['current_streak'] += 1
                        streak['xp_earned'] += 10
                        streak['longest_streak'] = max(streak['longest_streak'], streak['current_streak'])
                    else:
                        streak['current_streak'] = 0
                    return streak
            return {}
        
        response = (
            self.client.table('streaks')
            .select('*')
            .eq('user_id', user_id)
            .eq('streak_type', streak_type)
            .single()
            .execute()
        )
        
        if response.data:
            streak = response.data
            today = date.today().isoformat()
            
            if increment:
                new_streak = streak['current_streak'] + 1
            else:
                new_streak = 0
            
            update_data = {
                'current_streak': new_streak,
                'longest_streak': max(streak['longest_streak'], new_streak),
                'last_activity_date': today,
                'xp_earned': streak['xp_earned'] + (10 if increment else 0)
            }
            
            result = (
                self.client.table('streaks')
                .update(update_data)
                .eq('id', streak['id'])
                .execute()
            )
            return result.data[0] if result.data else None
        
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
        
        if self.is_mock:
            self._mock_data['ai_plans'].append(plan)
            return plan
        
        response = self.client.table('ai_plans').insert(plan).execute()
        return response.data[0] if response.data else None
    
    async def get_active_plans(self, user_id: str) -> List[Dict]:
        """Get active AI plans for a user"""
        if self.is_mock:
            return [
                p for p in self._mock_data['ai_plans'] 
                if p['user_id'] == user_id and p['is_active']
            ]
        
        response = (
            self.client.table('ai_plans')
            .select('*')
            .eq('user_id', user_id)
            .eq('is_active', True)
            .order('created_at', desc=True)
            .execute()
        )
        return response.data or []
    
    async def deactivate_plan(self, user_id: str, plan_id: str) -> bool:
        """Deactivate an AI plan"""
        if self.is_mock:
            for plan in self._mock_data['ai_plans']:
                if plan['id'] == plan_id and plan['user_id'] == user_id:
                    plan['is_active'] = False
            return True
        
        self.client.table('ai_plans').update({'is_active': False}).eq('user_id', user_id).eq('id', plan_id).execute()
        return True
