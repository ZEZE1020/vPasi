"""
Security — webhook authentication for Africa's Talking callbacks.

AT does not use HMAC signatures. Their webhook security model uses:
1. IP whitelisting (handled at infrastructure/firewall level)
2. API key validation via a custom header

In dev mode, validation is skipped when the header is absent.
"""

import logging
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status

from src.core.config import settings

logger = logging.getLogger(__name__)


async def verify_at_signature(
    x_africastalking_signature: Annotated[
        str | None, Header()
    ] = None,
) -> None:
    """
    Validate Africa's Talking webhook callback.

    In dev mode, skip validation if header is absent.
    In production, reject requests without the expected API key header.
    """
    if (
        settings.ENVIRONMENT == "dev"
        and x_africastalking_signature is None
    ):
        logger.debug(
            "Skipping AT signature validation in dev mode"
        )
        return

    if x_africastalking_signature is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-AfricasTalking-Signature header",
        )

    # AT sends the API key as the signature value
    if x_africastalking_signature != settings.AT_API_KEY:
        logger.warning("Invalid AT webhook signature received")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid webhook signature",
        )


# Reusable FastAPI dependency
ATSignatureDep = Annotated[None, Depends(verify_at_signature)]
