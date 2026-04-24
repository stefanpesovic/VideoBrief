"""Shared test fixtures."""

import pytest


@pytest.fixture(autouse=True)
def _set_test_env(monkeypatch):
    """Set required environment variables for tests."""
    monkeypatch.setenv("GROQ_API_KEY", "test-api-key-123")
    monkeypatch.setenv("GROQ_MODEL", "llama-3.3-70b-versatile")
