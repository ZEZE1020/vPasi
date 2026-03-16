"""
SQLAlchemy async database setup.
"""

from sqlalchemy import URL
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from src.core.config import settings


class Base(DeclarativeBase):
    """SQLAlchemy declarative base."""


def _build_database_url() -> str:
    """Build a database URL from component settings when DATABASE_URL is unset."""
    if settings.DATABASE_URL:
        return settings.DATABASE_URL

    if not all([
        settings.POSTGRES_USER,
        settings.POSTGRES_PASSWORD,
        settings.POSTGRES_DB,
    ]):
        return ""

    if settings.POSTGRES_HOST.startswith("/"):
        return str(
            URL.create(
                "postgresql+asyncpg",
                username=settings.POSTGRES_USER,
                password=settings.POSTGRES_PASSWORD,
                database=settings.POSTGRES_DB,
                query={"host": settings.POSTGRES_HOST},
            )
        )

    return str(
        URL.create(
            "postgresql+asyncpg",
            username=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            host=settings.POSTGRES_HOST or None,
            port=settings.POSTGRES_PORT,
            database=settings.POSTGRES_DB,
        )
    )


def get_engine():
    """Create async engine from DATABASE_URL."""
    database_url = _build_database_url()
    if not database_url:
        return None
    return create_async_engine(database_url, echo=False)


def get_session_factory():
    """Create async session factory."""
    engine = get_engine()
    if engine is None:
        return None
    return async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
