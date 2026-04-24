"""Async wrapper around Groq via LangChain."""

import logging

from langchain_groq import ChatGroq

from app.config import Settings

logger = logging.getLogger(__name__)


def create_groq_llm(settings: Settings) -> ChatGroq:
    """Create a ChatGroq instance from application settings.

    Args:
        settings: Application settings containing Groq configuration.

    Returns:
        A configured ChatGroq instance.
    """
    logger.info("Initializing Groq LLM with model: %s", settings.GROQ_MODEL)
    return ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=settings.GROQ_MODEL,
        temperature=settings.LLM_TEMPERATURE,
        max_tokens=settings.LLM_MAX_TOKENS,
        timeout=settings.LLM_TIMEOUT_SECONDS,
    )
