"""Application configuration via environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """App settings loaded from environment variables."""

    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    LLM_TIMEOUT_SECONDS: int = 30
    LLM_TEMPERATURE: float = 0.1
    LLM_MAX_TOKENS: int = 1000
    AGENT_TIMEOUT_SECONDS: int = 120
    MAX_TRANSCRIPT_LENGTH: int = 50000
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    LOG_LEVEL: str = "INFO"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [
            origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()
        ]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


def get_settings() -> Settings:
    """Create and return a Settings instance."""
    return Settings()
