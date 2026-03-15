"""
USSD handler — multi-step menu with real AI responses via the research graph.
"""

import logging
import uuid
from typing import Any

from src.graph.research import research_graph
from src.services.africastalking import get_at_client
from src.services.redis_store import RedisSessionStore

logger = logging.getLogger(__name__)

MAIN_MENU = (
    "Welcome to vPasi\n"
    "1. Border requirements\n"
    "2. Market prices\n"
    "3. Duties & tariffs\n"
    "4. Ask a question\n"
    "0. Exit"
)

# Maps menu choice → query prefix fed to the research graph
QUERY_PREFIXES: dict[str, str] = {
    "1": "Border crossing requirements and documents needed for: ",
    "2": "Current market prices for: ",
    "3": "Import duties and tariffs for: ",
    "4": "",
}

PROMPTS: dict[str, str] = {
    "1": "Border Requirements\nEnter border post or country pair\n(e.g., Busia Kenya-Uganda):",
    "2": "Market Prices\nEnter commodity name\n(e.g., maize, beans, sugar):",
    "3": "Duty Calculator\nEnter commodity and destination\n(e.g., textiles to Kenya):",
    "4": "Ask your trade question:",
}


def _truncate_ussd(text: str, max_len: int = 160) -> str:
    """USSD screens are limited — truncate gracefully."""
    if len(text) <= max_len:
        return text
    return text[: max_len - 3] + "..."


async def _run_research(query: str) -> str:
    """Run the research graph and return a USSD-safe answer."""
    try:
        result = await research_graph.ainvoke(
            {
                "user_query": query,
                "channel": "ussd",
                "search_queries": [],
                "search_results": [],
                "reflection": "",
                "iteration": 0,
                "max_iterations": 1,  # Single iteration for USSD speed
                "answer": "",
                "citations": [],
                "timeline": [],
                "error": None,
            },
            config={"configurable": {"thread_id": str(uuid.uuid4())}},
        )
        answer = result.get("answer", "")
        return _truncate_ussd(answer) if answer else "No results found. Try rephrasing."
    except Exception:
        logger.exception("USSD research failed")
        return "Service unavailable. Please try again shortly."


async def handle_ussd_request(
    session_id: str,
    service_code: str,
    phone_number: str,
    text: str,
    redis: RedisSessionStore | None,
) -> str:
    """
    Handle USSD requests.

    If Redis is not available, informs the user that the service is
    temporarily unavailable.
    """
    at = get_at_client()

    if not redis:
        logger.warning("USSD request received but Redis is not configured")
        return at.format_ussd_response(
            "The USSD service is temporarily unavailable. Please try our WhatsApp or web channels.",
            is_terminal=True,
        )

    logger.info(
        "USSD request",
        extra={"session_id": session_id, "phone": phone_number, "text": text},
    )

    inputs = [i for i in text.split("*")] if text else []
    level = len(inputs)

    session: dict[str, Any] = await redis.get_session(session_id) or {
        "phone": phone_number,
    }

    at = get_at_client()

    # ── Level 0: Show main menu ───────────────────────────────
    if level == 0:
        await redis.set_session(session_id, session)
        return at.format_ussd_response(MAIN_MENU)

    choice = inputs[0]

    if choice == "0":
        await redis.delete_session(session_id)
        return at.format_ussd_response("Thank you for using vPasi! Safe trading.", is_terminal=True)

    if choice not in PROMPTS:
        return at.format_ussd_response(f"Invalid option.\n{MAIN_MENU}")

    # ── Level 1: Show sub-menu prompt ─────────────────────────
    if level == 1:
        session["choice"] = choice
        await redis.set_session(session_id, session)
        return at.format_ussd_response(PROMPTS[choice])

    # ── Level 2: User provided input — run research ───────────
    user_input = "*".join(inputs[1:]).strip()
    stored_choice = session.get("choice", choice)
    prefix = QUERY_PREFIXES.get(stored_choice, "")
    query = f"{prefix}{user_input}"

    answer = await _run_research(query)
    response = f"{answer}\n\n0. Main menu"

    await redis.set_session(session_id, session)
    return at.format_ussd_response(_truncate_ussd(response, 182))
