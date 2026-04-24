"""Health check endpoint."""

from fastapi import APIRouter

from app.config import Settings
from app.models import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check(settings: Settings | None = None) -> HealthResponse:
    """Check service health and configuration status.

    Returns:
        HealthResponse with status and config flags.
    """
    if settings is None:
        from app.main import get_app_settings

        settings = get_app_settings()

    return HealthResponse(
        status="ok",
        groq_configured=bool(
            settings.GROQ_API_KEY and settings.GROQ_API_KEY != "your_groq_key_here"
        ),
        model=settings.GROQ_MODEL,
    )
