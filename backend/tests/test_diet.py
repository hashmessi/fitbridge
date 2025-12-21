"""
Tests for diet router endpoints.
All Supabase calls are mocked.
"""

import pytest


class TestCreateMealLog:
    """Tests for POST /api/diet/log endpoint."""

    def test_create_meal_log_success(self, client, auth_headers, mock_supabase_service):
        """Should create a meal log successfully."""
        payload = {
            "meal_type": "Breakfast",
            "meal_name": "Oatmeal with fruits",
            "calories": 350,
            "protein": 12,
            "carbs": 55,
            "fats": 8
        }
        
        response = client.post("/api/diet/log", json=payload, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        mock_supabase_service.create_diet_log.assert_called_once()

    def test_create_meal_log_missing_meal_type(self, client, auth_headers):
        """Should fail when meal_type is missing."""
        payload = {
            "meal_name": "Oatmeal",
            "calories": 350
        }
        
        response = client.post("/api/diet/log", json=payload, headers=auth_headers)
        
        assert response.status_code == 422

    def test_create_meal_log_missing_calories(self, client, auth_headers):
        """Should fail when calories is missing."""
        payload = {
            "meal_type": "Breakfast",
            "meal_name": "Oatmeal"
        }
        
        response = client.post("/api/diet/log", json=payload, headers=auth_headers)
        
        assert response.status_code == 422


class TestGetDietLogs:
    """Tests for GET /api/diet/logs endpoint."""

    def test_get_diet_logs_empty(self, client, auth_headers, mock_supabase_service):
        """Should return empty list when no meals exist."""
        response = client.get("/api/diet/logs", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"] == []

    def test_get_diet_logs_with_data(self, client, auth_headers, mock_supabase_service):
        """Should return meal logs when they exist."""
        mock_supabase_service.get_diet_logs.return_value = [
            {
                "id": "meal-1",
                "meal_type": "Breakfast",
                "meal_name": "Oatmeal",
                "calories": 350,
                "log_date": "2025-12-21"
            }
        ]
        
        response = client.get("/api/diet/logs", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]) == 1
        assert data["data"][0]["meal_name"] == "Oatmeal"

    def test_get_diet_logs_by_date(self, client, auth_headers):
        """Should accept log_date filter parameter."""
        response = client.get("/api/diet/logs?log_date=2025-12-21", headers=auth_headers)
        
        assert response.status_code == 200


class TestGetTodayMeals:
    """Tests for GET /api/diet/logs/today endpoint."""

    def test_get_today_meals_empty(self, client, auth_headers, mock_supabase_service):
        """Should return empty meals with zero totals."""
        mock_supabase_service.get_diet_logs.return_value = []
        
        response = client.get("/api/diet/logs/today", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["totals"]["calories"] == 0

    def test_get_today_meals_with_data(self, client, auth_headers, mock_supabase_service):
        """Should calculate totals correctly."""
        mock_supabase_service.get_diet_logs.return_value = [
            {"calories": 350, "protein": 12, "carbs": 55, "fats": 8},
            {"calories": 600, "protein": 45, "carbs": 40, "fats": 25}
        ]
        
        response = client.get("/api/diet/logs/today", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["totals"]["calories"] == 950
        assert data["data"]["totals"]["protein"] == 57


class TestGetDietStats:
    """Tests for GET /api/diet/stats endpoint."""

    def test_get_diet_stats_default_days(self, client, auth_headers, mock_supabase_service):
        """Should return stats for default 7 days."""
        response = client.get("/api/diet/stats", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    def test_get_diet_stats_custom_days(self, client, auth_headers):
        """Should accept custom days parameter."""
        response = client.get("/api/diet/stats?days=30", headers=auth_headers)
        
        assert response.status_code == 200


class TestDeleteMealLog:
    """Tests for DELETE /api/diet/logs/{meal_id} endpoint."""

    def test_delete_meal_log_success(self, client, auth_headers, mock_supabase_service):
        """Should delete a meal log successfully."""
        response = client.delete("/api/diet/logs/meal-1", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        mock_supabase_service.delete_diet_log.assert_called_once()
