"""
USSD handler — business logic for USSD *483# menu interactions.

Manages multi-step session navigation and delegates AI queries
to the Vertex AI service.
"""

import logging
from typing import Any

from src.services.africastalking import get_at_client
from src.services.redis_store import RedisSessionStore

logger = logging.getLogger(__name__)

# ── Menu Definitions ─────────────────────────────────────────────

MAIN_MENU = (
    "Welcome to vPasi Trade Helper \n"
    "1. Check border requirements\n"
    "2. Get market prices\n"
    "3. Calculate duties & tariffs\n"
    "4. Ask a trade question\n"
    "0. Exit"
)

SUB_MENUS: dict[str, str] = {
    "1": ("Border Requirements\nEnter the border post name\n(e.g., Busia, Malaba, Namanga):"),
    "2": ("Market Prices\nEnter the commodity name\n(e.g., maize, beans, sugar):"),
    "3": ("Duty Calculator\nEnter the commodity and destination country\n(e.g., maize to Kenya):"),
    "4": "Ask your trade question:",
}


async def handle_ussd_request(
    session_id: str,
    service_code: str,
    phone_number: str,
    text: str,
    redis: RedisSessionStore,
) -> str:
    """
    Process a USSD callback from Africa's Talking.

    Args:
        session_id: AT-assigned session identifier.
        service_code: The dialed USSD shortcode (e.g., *483#).
        phone_number: Caller's phone in international format.
        text: Accumulated USSD input, delimited by '*'.
        redis: Redis session store instance.

    Returns:
        Formatted USSD response string (CON/END prefixed).
    """
    logger.info(
        "USSD request received",
        extra={
            "session_id": session_id,
            "service_code": service_code,
            "phone_number": phone_number,
            "text": text,
        },
    )

    # Parse the input chain — AT sends cumulative input as "1*answer*..."
    inputs = text.split("*") if text else []
    level = len(inputs)

    # Retrieve or initialize session
    session: dict[str, Any] = await redis.get_session(session_id) or {
        "phone": phone_number,
        "level": 0,
        "history": [],
    }

    # ── Level 0: Main menu (no input yet) ────────────────────
    if level == 0:
        session["level"] = 0
        await redis.set_session(session_id, session)
        return get_at_client().format_ussd_response(MAIN_MENU)

    # ── Level 1: User selected a menu option ─────────────────
    choice = inputs[0]

    if choice == "0":
        await redis.delete_session(session_id)
        return get_at_client().format_ussd_response(
            "Thank you for using vPasi! Safe trading 🤝",
            is_terminal=True,
        )

    if choice not in SUB_MENUS:
        return get_at_client().format_ussd_response(
            f"Invalid option.\n{MAIN_MENU}",
        )

    if level == 1:
        # Show the sub-menu prompt
        session["level"] = 1
        session["menu_choice"] = choice
        await redis.set_session(session_id, session)
        return get_at_client().format_ussd_response(SUB_MENUS[choice])

    # ── Level 2+: User provided input to a sub-menu ──────────
    user_query = "*".join(inputs[1:])  # Everything after the menu choice
    session["level"] = 2
    session["history"].append({"role": "user", "content": user_query})

    # For now, echo back — will be replaced by Vertex AI call
    # TODO: Integrate vertex_client.generate_response() here
    response_text = f"You asked about: {user_query}\nThis feature is coming soon!\n0. Back to menu"

    session["history"].append({"role": "assistant", "content": response_text})
    await redis.set_session(session_id, session)

    return get_at_client().format_ussd_response(response_text)
