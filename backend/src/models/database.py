"""
SQLAlchemy async database setup.
"""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from src.core.config import settings


class Base(DeclarativeBase):
    """SQLAlchemy declarative base."""


def get_engine():
    """Create async engine from DATABASE_URL."""
    if not settings.DATABASE_URL:
        return None
    return create_async_engine(settings.DATABASE_URL, echo=False)


def get_session_factory():
    """Create async session factory."""
    engine = get_engine()
    if engine is None:
        return None
    return async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
