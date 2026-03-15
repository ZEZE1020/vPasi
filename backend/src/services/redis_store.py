"""
Redis session store for USSD session management.

Provides async get/set/delete of session state with automatic TTL
to align with Africa's Talking USSD session timeouts.
"""

import json
import logging
from typing import Any

import redis.asyncio as aioredis

from src.core.config import settings

logger = logging.getLogger(__name__)


class RedisSessionStore:
    """
    Async Redis wrapper for USSD session state.

    Sessions are stored as JSON-encoded dicts keyed by AT session ID.
    TTL is automatically applied to match USSD session timeout.
    """

    def __init__(self) -> None:
        self._client: aioredis.Redis | None = None

    async def connect(self) -> None:
        """Initialize the Redis connection pool."""
        self._client = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            max_connections=20,
        )
        # Verify connectivity
        try:
            await self._client.ping()
            logger.info("Redis connected", extra={"url": settings.REDIS_URL})
        except Exception:
            logger.exception("Redis connection failed")
            raise

    async def disconnect(self) -> None:
        """Close the Redis connection pool."""
        if self._client:
            await self._client.aclose()
            logger.info("Redis disconnected")

    @property
    def client(self) -> aioredis.Redis:
        """Return the active Redis client, raising if not connected."""
        if self._client is None:
            raise RuntimeError("Redis client not initialized — call connect() first")
        return self._client

    # ── Session Operations ───────────────────────────────────────

    async def get_session(self, session_id: str) -> dict[str, Any] | None:
        """
        Retrieve a USSD session by AT session ID.

        Args:
            session_id: Africa's Talking session identifier.

        Returns:
            Deserialized session dict, or None if expired/missing.
        """
        raw = await self.client.get(f"ussd:session:{session_id}")
        if raw is None:
            return None
        return json.loads(raw)  # type: ignore[no-any-return]

    async def set_session(
        self,
        session_id: str,
        data: dict[str, Any],
        ttl: int | None = None,
    ) -> None:
        """
        Store or update a USSD session.

        Args:
            session_id: Africa's Talking session identifier.
            data: Session state to persist.
            ttl: Time-to-live in seconds. Defaults to REDIS_SESSION_TTL.
        """
        ttl = ttl or settings.REDIS_SESSION_TTL
        await self.client.set(
            f"ussd:session:{session_id}",
            json.dumps(data),
            ex=ttl,
        )
        logger.debug(
            "Session stored",
            extra={"session_id": session_id, "ttl": ttl},
        )

    async def delete_session(self, session_id: str) -> None:
        """
        Delete a USSD session (e.g., on END).

        Args:
            session_id: Africa's Talking session identifier.
        """
        await self.client.delete(f"ussd:session:{session_id}")
        logger.debug("Session deleted", extra={"session_id": session_id})

    # ── Generic Cache Operations ─────────────────────────────────

    async def cache_get(self, key: str) -> str | None:
        """Get a cached value by key."""
        return await self.client.get(f"vpasi:cache:{key}")

    async def cache_set(self, key: str, value: str, ttl: int = 3600) -> None:
        """Set a cached value with TTL."""
        await self.client.set(f"vpasi:cache:{key}", value, ex=ttl)
