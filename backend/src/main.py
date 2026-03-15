"""
vPasi Backend — Application entry point.

Initializes the FastAPI application, middleware, and webhook routers.
"""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.research import router as research_router
from src.api.routes import router as webhook_router
from src.core.config import settings
from src.core.logging import setup_logging
from src.models.database import Base, get_engine
from src.services.redis_store import RedisSessionStore

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Manage application lifecycle — startup and shutdown hooks."""
    setup_logging()
    logger.info(
        "Starting vPasi backend",
        extra={"environment": settings.ENVIRONMENT, "project_id": settings.GOOGLE_PROJECT_ID},
    )

    # Create Postgres tables if configured. Do not crash app startup if DB is unavailable.
    engine = get_engine()
    if engine:
        try:
            import src.models  # noqa: F401 — ensure models are registered
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            app.state.db_engine = engine
            logger.info("Postgres tables ready")
        except Exception:
            app.state.db_engine = None
            logger.exception("Postgres initialization failed — continuing without DB persistence")
    else:
        app.state.db_engine = None
        logger.warning("DATABASE_URL not set — Postgres persistence disabled")

    # Initialize Redis connection pool if configured
    if settings.REDIS_URL:
        redis_store = RedisSessionStore()
        await redis_store.connect()
        app.state.redis = redis_store
        logger.info("Redis connection pool initialized")
    else:
        app.state.redis = None
        logger.warning("REDIS_URL not set — USSD support disabled")

    yield

    # Graceful shutdown
    logger.info("Shutting down vPasi backend")
    if app.state.redis:
        await app.state.redis.disconnect()


def create_app() -> FastAPI:
    """Application factory."""
    app = FastAPI(
        title="vPasi Trade Assistant",
        description="AI-powered trade assistant for informal cross-border traders in Africa",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs" if settings.ENVIRONMENT == "dev" else None,
        redoc_url=None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if settings.ENVIRONMENT == "dev" else [],
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

    app.include_router(webhook_router)
    app.include_router(research_router)

    @app.get("/health")
    async def health_check() -> dict[str, str]:
        return {"status": "ok", "service": "vpasi-backend"}

    return app


app = create_app()
