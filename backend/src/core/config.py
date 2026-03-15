"""
Core configuration — loads and validates environment variables.

Uses pydantic-settings to ensure all required secrets/config are present at startup.
"""

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings validated from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── Environment ──────────────────────────────────────────────
    ENVIRONMENT: Literal["dev", "staging", "prod"] = "dev"
    LOG_LEVEL: str = "INFO"

    # ── Africa's Talking ─────────────────────────────────────────
    AT_API_KEY: str
    AT_USERNAME: str

    # ── Google Cloud / Gemini ─────────────────────────────────────
    GEMINI_API_KEY: str = ""
    GOOGLE_PROJECT_ID: str
    GOOGLE_LOCATION: str = "us-central1"
    VERTEX_AI_MODEL: str = "gemini-2.0-flash-lite"

    # ── LangGraph / LangSmith ─────────────────────────────────────
    LANGSMITH_API_KEY: str = ""
    LANGCHAIN_TRACING_V2: bool = False
    LANGCHAIN_PROJECT: str = "vpasi"

    # ── Research graph controls ────────────────────────────────────
    RESEARCH_TOKEN_BUDGET: int = 600
    RESEARCH_SKIP_REFLECTION_MAX_QUERY_WORDS: int = 12
    RESEARCH_SKIP_REFLECTION_MIN_RESULTS: int = 3

    # ── Redis ────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_SESSION_TTL: int = 300  # seconds — 5 minute USSD timeout

    # ── Postgres ─────────────────────────────────────────────────
    DATABASE_URL: str = ""

    # ── Server ───────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton — called lazily on first attribute access."""
    return Settings()  # type: ignore[call-arg]


class _LazySettings:
    """
    Lazy proxy that defers Settings() construction until first attribute access.

    This prevents import-time crashes when .env or environment variables
    are not yet available (e.g., during test collection or static analysis).
    """

    _instance: Settings | None = None

    def _load(self) -> Settings:
        if self._instance is None:
            self._instance = get_settings()
        return self._instance

    def __getattr__(self, name: str) -> object:
        return getattr(self._load(), name)


settings: Settings = _LazySettings()  # type: ignore[assignment]
