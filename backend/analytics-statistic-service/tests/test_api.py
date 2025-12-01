"""
Integration tests for API endpoints
"""
import pytest
from httpx import AsyncClient
from fastapi import status

from app.main import app


@pytest.fixture
async def client():
    """Create test client"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_root_endpoint(client):
    """Test root endpoint"""
    response = await client.get("/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "service" in data
    assert "version" in data


@pytest.mark.asyncio
async def test_health_check(client):
    """Test health check endpoint"""
    response = await client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_quiz_report_unauthorized(client):
    """Test quiz report without authentication"""
    response = await client.get("/api/v1/report/quiz/1")
    # Should still work but might have limited data
    assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]


@pytest.mark.asyncio
async def test_export_csv_missing_params(client):
    """Test CSV export with missing parameters"""
    response = await client.get("/api/v1/export/csv")
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


