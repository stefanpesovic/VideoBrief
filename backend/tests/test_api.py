"""Tests for API endpoints."""

import asyncio
from unittest.mock import patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.config import Settings
from app.main import create_app, reset_app_state


@pytest.fixture(autouse=True)
def _reset():
    """Reset app state before each test."""
    reset_app_state()
    yield
    reset_app_state()


@pytest.fixture
def settings():
    """Create test settings."""
    return Settings(
        GROQ_API_KEY="test-key-123",
        GROQ_MODEL="llama-3.3-70b-versatile",
    )


@pytest.fixture
def app(settings):
    """Create a test app instance."""
    return create_app(settings=settings)


@pytest.fixture
async def client(app):
    """Create an async test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


class TestHealthEndpoint:
    """Tests for GET /health."""

    @pytest.mark.asyncio
    async def test_health_returns_ok(self, client):
        response = await client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["groq_configured"] is True
        assert data["model"] == "llama-3.3-70b-versatile"

    @pytest.mark.asyncio
    async def test_health_groq_not_configured(self):
        reset_app_state()
        settings = Settings(
            GROQ_API_KEY="your_groq_key_here",
            GROQ_MODEL="llama-3.3-70b-versatile",
        )
        app = create_app(settings=settings)
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/health")

        data = response.json()
        assert data["groq_configured"] is False


class TestSummarizeEndpoint:
    """Tests for POST /summarize."""

    @pytest.mark.asyncio
    async def test_invalid_url_returns_422(self, client):
        response = await client.post(
            "/summarize",
            json={"url": "https://example.com/not-youtube"},
        )

        assert response.status_code == 422
        assert "Invalid YouTube URL" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_missing_url_returns_422(self, client):
        response = await client.post("/summarize", json={})

        assert response.status_code == 422

    @patch("app.routes.summarize.run_pipeline")
    @pytest.mark.asyncio
    async def test_valid_url_returns_success(self, mock_pipeline, client):
        mock_pipeline.return_value = {
            "report": "# Video Summary\nGreat video",
            "stages": [
                {"name": "Fetching transcript", "status": "completed"},
                {"name": "Analyzing content", "status": "completed"},
                {"name": "Extracting topics", "status": "completed"},
                {"name": "Generating timestamps", "status": "completed"},
                {"name": "Generating report", "status": "completed"},
            ],
        }

        response = await client.post(
            "/summarize",
            json={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["markdown_report"] == "# Video Summary\nGreat video"
        assert len(data["stages"]) == 5
        assert data["metadata"]["video_id"] == "dQw4w9WgXcQ"

    @patch("app.routes.summarize.run_pipeline")
    @pytest.mark.asyncio
    async def test_no_transcript_returns_404(self, mock_pipeline, client):
        mock_pipeline.return_value = {
            "error": "No transcript available for this video.",
            "stages": [{"name": "Fetching transcript", "status": "failed"}],
        }

        response = await client.post(
            "/summarize",
            json={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
        )

        assert response.status_code == 404
        assert "No transcript" in response.json()["detail"]

    @patch("app.routes.summarize.run_pipeline")
    @pytest.mark.asyncio
    async def test_rate_limit_returns_429(self, mock_pipeline, client):
        mock_pipeline.side_effect = Exception("Rate limit exceeded")

        response = await client.post(
            "/summarize",
            json={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
        )

        assert response.status_code == 429
        assert "too many requests" in response.json()["detail"].lower()
        assert response.headers.get("retry-after") == "30"

    @patch("app.routes.summarize.run_pipeline")
    @pytest.mark.asyncio
    async def test_timeout_returns_504(self, mock_pipeline, client):
        mock_pipeline.side_effect = asyncio.TimeoutError()

        response = await client.post(
            "/summarize",
            json={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
        )

        assert response.status_code == 504
        assert "too long" in response.json()["detail"].lower()

    @patch("app.routes.summarize.run_pipeline")
    @pytest.mark.asyncio
    async def test_unexpected_error_returns_500(self, mock_pipeline, client):
        mock_pipeline.side_effect = RuntimeError("Something broke")

        response = await client.post(
            "/summarize",
            json={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
        )

        assert response.status_code == 500
        assert "unexpected error" in response.json()["detail"].lower()

    @patch("app.routes.summarize.run_pipeline")
    @pytest.mark.asyncio
    async def test_short_url_format_accepted(self, mock_pipeline, client):
        mock_pipeline.return_value = {
            "report": "report",
            "stages": [],
        }

        response = await client.post(
            "/summarize",
            json={"url": "https://youtu.be/dQw4w9WgXcQ"},
        )

        assert response.status_code == 200
        assert response.json()["metadata"]["video_id"] == "dQw4w9WgXcQ"
