"""Pydantic models for API requests and responses."""

from pydantic import BaseModel, Field


class SummarizeRequest(BaseModel):
    """Request body for the /summarize endpoint."""

    url: str = Field(..., description="YouTube video URL to summarize")


class StageInfo(BaseModel):
    """Represents a single processing stage."""

    name: str
    status: str = "pending"  # pending | running | completed | failed
    progress: float | None = None


class VideoMetadata(BaseModel):
    """Metadata about the processed video."""

    video_id: str
    title: str | None = None
    url: str


class SummarizeResponse(BaseModel):
    """Response body for the /summarize endpoint."""

    status: str  # success | error
    markdown_report: str | None = None
    stages: list[StageInfo] = []
    metadata: VideoMetadata | None = None
    error: str | None = None


class HealthResponse(BaseModel):
    """Response body for the /health endpoint."""

    status: str
    groq_configured: bool
    model: str
