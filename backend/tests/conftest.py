"""
Shared test fixtures for FitBridge backend tests.
All external services (Supabase, AI) are mocked.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.services.supabase_service import SupabaseService
from app.config import Settings


# -----------------------------------------------------------------------------
# Test User Fixtures
# -----------------------------------------------------------------------------

@pytest.fixture
def test_user_id() -> str:
    """Test user ID for authentication."""
    return "test-user-123"


@pytest.fixture
def auth_headers(test_user_id: str) -> dict:
    """Authorization headers with test user token."""
    return {"Authorization": f"Bearer {test_user_id}"}


# -----------------------------------------------------------------------------
# Mock Supabase Service
# -----------------------------------------------------------------------------

@pytest.fixture
def mock_supabase_service():
    """Mock SupabaseService with common operations."""
    mock = MagicMock(spec=SupabaseService)
    
    # Workout operations
    mock.create_workout_log = AsyncMock(return_value={
        "id": "workout-1",
        "title": "Test Workout",
        "duration_minutes": 30,
        "calories_burned": 200,
        "workout_date": "2025-12-21",
        "created_at": "2025-12-21T10:00:00Z"
    })
    mock.get_workout_logs = AsyncMock(return_value=[])
    mock.get_workout_log = AsyncMock(return_value=None)
    mock.delete_workout_log = AsyncMock(return_value=True)
    mock.get_workout_stats = AsyncMock(return_value={
        "total_workouts": 0,
        "total_duration": 0,
        "total_calories": 0
    })
    mock.update_daily_log = AsyncMock(return_value=True)
    
    # Diet operations
    mock.create_diet_log = AsyncMock(return_value={
        "id": "meal-1",
        "meal_type": "breakfast",
        "meal_name": "Test Meal",
        "calories": 300,
        "log_date": "2025-12-21",
        "created_at": "2025-12-21T08:00:00Z"
    })
    mock.get_diet_logs = AsyncMock(return_value=[])
    mock.get_today_meals = AsyncMock(return_value={
        "meals": [],
        "total_calories": 0
    })
    mock.get_diet_stats = AsyncMock(return_value={
        "total_meals": 0,
        "avg_calories": 0
    })
    mock.delete_diet_log = AsyncMock(return_value=True)
    
    return mock


# -----------------------------------------------------------------------------
# Mock AI Service
# -----------------------------------------------------------------------------

@pytest.fixture
def mock_ai_response():
    """Mock AI-generated workout plan response."""
    return {
        "title": "Test Workout Plan",
        "duration": "4 weeks",
        "difficulty": "Intermediate",
        "schedule": [
            {
                "dayTitle": "Day 1 - Upper Body",
                "exercises": [
                    {"name": "Push-ups", "sets": 3, "reps": "12", "notes": "Keep core tight"}
                ]
            }
        ]
    }


@pytest.fixture
def mock_diet_response():
    """Mock AI-generated diet plan response."""
    return {
        "dailyCalories": 2000,
        "macros": {"protein": 150, "carbs": 200, "fats": 70},
        "meals": {
            "breakfast": {
                "name": "Oatmeal with fruits",
                "calories": 400,
                "protein": 15,
                "carbs": 60,
                "fats": 10,
                "description": "Healthy start"
            },
            "lunch": {
                "name": "Grilled chicken salad",
                "calories": 600,
                "protein": 45,
                "carbs": 40,
                "fats": 25,
                "description": "Protein-rich lunch"
            },
            "dinner": {
                "name": "Salmon with vegetables",
                "calories": 700,
                "protein": 50,
                "carbs": 50,
                "fats": 30,
                "description": "Omega-3 rich dinner"
            },
            "snack": {
                "name": "Greek yogurt",
                "calories": 300,
                "protein": 40,
                "carbs": 50,
                "fats": 5,
                "description": "Protein snack"
            }
        }
    }


# -----------------------------------------------------------------------------
# Test Client with Mocked Dependencies
# -----------------------------------------------------------------------------

@pytest.fixture
def client(mock_supabase_service):
    """FastAPI test client with mocked Supabase service."""
    from app.routers import workout, diet
    
    # Override the dependency
    def get_mock_supabase():
        return mock_supabase_service
    
    app.dependency_overrides[workout.get_supabase_service] = get_mock_supabase
    app.dependency_overrides[diet.get_supabase_service] = get_mock_supabase
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up overrides
    app.dependency_overrides.clear()
