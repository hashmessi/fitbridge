"""
Tests for AI generation endpoints.
AI service is mocked to avoid external API calls.
"""

import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.routers import ai as ai_router


@pytest.fixture
def mock_ai_service(mock_ai_response, mock_diet_response):
    """Mock AI service for testing."""
    mock = MagicMock()
    mock.generate_workout_plan = AsyncMock(return_value=mock_ai_response)
    mock.generate_diet_plan = AsyncMock(return_value=mock_diet_response)
    mock.is_ready = MagicMock(return_value=True)
    return mock


@pytest.fixture
def client_with_ai(mock_ai_service):
    """Test client with mocked AI service."""
    def get_mock_ai():
        return mock_ai_service
    
    app.dependency_overrides[ai_router.get_ai_service] = get_mock_ai
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


class TestGenerateWorkoutPlan:
    """Tests for POST /api/ai/generate with plan_type=workout."""

    def test_generate_workout_plan_success(self, client_with_ai, mock_ai_service):
        """Should generate a workout plan successfully."""
        payload = {
            "user_description": "Build muscle, intermediate level",
            "plan_type": "workout",
            "user_profile": {
                "name": "Test User",
                "weight": 70,
                "height": 175,
                "goal": "muscle_gain",
                "fitness_level": "intermediate"
            }
        }
        
        response = client_with_ai.post("/api/ai/generate", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "plan" in data
        assert data["plan"]["title"] == "Test Workout Plan"
        mock_ai_service.generate_workout_plan.assert_called_once()

    def test_generate_workout_plan_minimal_request(self, client_with_ai):
        """Should work with just description and plan_type."""
        payload = {
            "user_description": "Lose weight quickly",
            "plan_type": "workout"
        }
        
        response = client_with_ai.post("/api/ai/generate", json=payload)
        
        assert response.status_code == 200
        assert response.json()["success"] is True


class TestGenerateDietPlan:
    """Tests for POST /api/ai/generate with plan_type=diet."""

    def test_generate_diet_plan_success(self, client_with_ai, mock_ai_service):
        """Should generate a diet plan successfully."""
        payload = {
            "user_description": "High protein vegetarian diet",
            "plan_type": "diet",
            "user_profile": {
                "name": "Test User",
                "weight": 65,
                "height": 165,
                "goal": "maintenance",
                "fitness_level": "beginner"
            }
        }
        
        response = client_with_ai.post("/api/ai/generate", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "plan" in data
        assert data["plan"]["dailyCalories"] == 2000
        mock_ai_service.generate_diet_plan.assert_called_once()


class TestInvalidPlanType:
    """Tests for invalid plan_type handling."""

    def test_generate_plan_invalid_type(self, client_with_ai):
        """Should return error for invalid plan_type."""
        payload = {
            "user_description": "Some description",
            "plan_type": "invalid_type"
        }
        
        response = client_with_ai.post("/api/ai/generate", json=payload)
        
        # API returns 200 with success=False and error message
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert "Invalid plan_type" in data["error"]

    def test_generate_plan_missing_description(self, client_with_ai):
        """Should return 422 when description is missing."""
        payload = {
            "plan_type": "workout"
        }
        
        response = client_with_ai.post("/api/ai/generate", json=payload)
        
        assert response.status_code == 422


class TestAIStatus:
    """Tests for GET /api/ai/status endpoint."""

    def test_ai_status_returns_provider_info(self, client_with_ai, mock_ai_service):
        """Should return AI provider status."""
        response = client_with_ai.get("/api/ai/status")
        
        assert response.status_code == 200
        data = response.json()
        assert "provider" in data
        assert "model" in data
        assert data["ready"] is True
