"""FastAPI application entry point."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import Settings, get_settings
from app.routes.health import router as health_router
from app.routes.summarize import router as summarize_router
from app.services.groq_client import create_groq_llm

logger = logging.getLogger(__name__)

_settings: Settings | None = None
_llm = None


def get_app_settings() -> Settings:
    """Get or create the application settings singleton."""
    global _settings
    if _settings is None:
        _settings = get_settings()
    return _settings


def get_app_llm():
    """Get or create the LLM singleton."""
    global _llm
    if _llm is None:
        _llm = create_groq_llm(get_app_settings())
    return _llm


def create_app(settings: Settings | None = None) -> FastAPI:
    """Create and configure the FastAPI application.

    Args:
        settings: Optional settings override (useful for testing).

    Returns:
        Configured FastAPI application.
    """
    global _settings, _llm

    if settings is not None:
        _settings = settings

    app = FastAPI(
        title="VideoBrief API",
        description="AI-powered YouTube video summarizer",
        version="1.0.0",
    )

    resolved_settings = _settings or get_app_settings()

    logging.basicConfig(
        level=getattr(logging, resolved_settings.LOG_LEVEL.upper(), logging.INFO),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=resolved_settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(summarize_router)

    return app


def reset_app_state() -> None:
    """Reset global singletons (for testing)."""
    global _settings, _llm
    _settings = None
    _llm = None


def get_app() -> FastAPI:
    """Get or create the default application instance."""
    return create_app()
