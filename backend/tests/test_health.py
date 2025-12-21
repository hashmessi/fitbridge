"""
Tests for health endpoints.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Test client for health endpoints (no mocking needed)."""
    with TestClient(app) as test_client:
        yield test_client


class TestHealthEndpoints:
    """Tests for health check endpoints."""

    def test_health_endpoint_returns_ok(self, client):
        """GET /health should return status ok."""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_root_endpoint_returns_api_info(self, client):
        """GET / should return API information."""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "FitBridge AI Backend"
        assert data["version"] == "1.0.0"
        assert data["status"] == "running"
        assert "docs" in data
