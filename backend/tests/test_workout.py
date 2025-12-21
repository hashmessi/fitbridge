"""
Tests for workout router endpoints.
All Supabase calls are mocked.
"""

import pytest


class TestCreateWorkoutLog:
    """Tests for POST /api/workout/log endpoint."""

    def test_create_workout_log_success(self, client, auth_headers, mock_supabase_service):
        """Should create a workout log successfully."""
        payload = {
            "title": "Morning Run",
            "duration_minutes": 30,
            "workout_type": "cardio",
            "calories_burned": 300
        }
        
        response = client.post("/api/workout/log", json=payload, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        mock_supabase_service.create_workout_log.assert_called_once()

    def test_create_workout_log_missing_title(self, client, auth_headers):
        """Should fail when title is missing."""
        payload = {
            "duration_minutes": 30
        }
        
        response = client.post("/api/workout/log", json=payload, headers=auth_headers)
        
        assert response.status_code == 422  # Validation error

    def test_create_workout_log_missing_duration(self, client, auth_headers):
        """Should fail when duration is missing."""
        payload = {
            "title": "Morning Run"
        }
        
        response = client.post("/api/workout/log", json=payload, headers=auth_headers)
        
        assert response.status_code == 422  # Validation error


class TestGetWorkoutLogs:
    """Tests for GET /api/workout/logs endpoint."""

    def test_get_workout_logs_empty(self, client, auth_headers, mock_supabase_service):
        """Should return empty list when no workouts exist."""
        response = client.get("/api/workout/logs", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"] == []

    def test_get_workout_logs_with_data(self, client, auth_headers, mock_supabase_service):
        """Should return workout logs when they exist."""
        mock_supabase_service.get_workout_logs.return_value = [
            {
                "id": "workout-1",
                "title": "Morning Run",
                "duration_minutes": 30,
                "workout_date": "2025-12-21"
            }
        ]
        
        response = client.get("/api/workout/logs", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]) == 1
        assert data["data"][0]["title"] == "Morning Run"

    def test_get_workout_logs_with_pagination(self, client, auth_headers):
        """Should accept limit and offset parameters."""
        response = client.get("/api/workout/logs?limit=5&offset=10", headers=auth_headers)
        
        assert response.status_code == 200


class TestGetWorkoutStats:
    """Tests for GET /api/workout/stats endpoint."""

    def test_get_workout_stats_default_days(self, client, auth_headers, mock_supabase_service):
        """Should return stats for default 7 days."""
        response = client.get("/api/workout/stats", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data

    def test_get_workout_stats_custom_days(self, client, auth_headers):
        """Should accept custom days parameter."""
        response = client.get("/api/workout/stats?days=30", headers=auth_headers)
        
        assert response.status_code == 200


class TestDeleteWorkoutLog:
    """Tests for DELETE /api/workout/logs/{workout_id} endpoint."""

    def test_delete_workout_log_success(self, client, auth_headers, mock_supabase_service):
        """Should delete a workout log successfully."""
        response = client.delete("/api/workout/logs/workout-1", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        mock_supabase_service.delete_workout_log.assert_called_once()
