"""
USSD handler — demo flow: ask for question, ask for phone, send SMS in background.
"""

import asyncio
import logging
import uuid
from typing import Any

from src.graph.research import research_graph
from src.services.africastalking import get_at_client
from src.services.redis_store import RedisSessionStore

logger = logging.getLogger(__name__)


def _truncate_ussd(text: str, max_len: int = 160) -> str:
    """USSD screens are limited — truncate gracefully."""
    if len(text) <= max_len:
        return text
    return text[: max_len - 3] + "..."
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


async def _run_research(query: str) -> str:
    """Run the research graph and return an answer."""
    try:
        result = await research_graph.ainvoke(
            {
                "user_query": query,
                "channel": "sms",  # Target output is SMS
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
        return answer if answer else "No results found. Try rephrasing."
    except Exception:
        logger.exception("Research failed")
        return "Service unavailable. Please try again shortly."


async def handle_ussd_request(
    session_id: str,
    service_code: str,
    phone_number: str,
    text: str,
    redis: RedisSessionStore | None,
) -> str:
    """
    Handle USSD requests (Demo Flow).
    1. Prompt for trade question.
    2. Prompt for phone number.
    3. Kick off background task to research and send SMS.
    Handle USSD requests.
    1. Show main menu.
    2. Prompt for specific query based on choice.
    3. Prompt for phone number.
    4. Kick off background task to research and send SMS.
    """
    at = get_at_client()

    if not redis:
        logger.warning("USSD request received but Redis is not configured")
        return at.format_ussd_response(
            "The USSD service is temporarily unavailable.",
            is_terminal=True,
        )

    logger.info(
        "USSD request",
        extra={"session_id": session_id, "phone": phone_number, "text": text},
    )

    raw_text = text.strip()
    inputs = raw_text.split("*") if raw_text else []
    level = len(inputs)

    session: dict[str, Any] = await redis.get_session(session_id) or {
        "phone": phone_number,
        "inputs": [],
    }

    # Handle Swagger sequential inputs vs AT concatenated inputs.
    if level == 1 and session.get("inputs"):
        session["inputs"].append(inputs[0])
        virtual_inputs = session["inputs"]
    else:
        virtual_inputs = inputs
        session["inputs"] = inputs

    virtual_level = len(virtual_inputs)

    # ── Level 0: show main menu ───────────────────────────────
    if virtual_level == 0:
        session["inputs"] = []
        await redis.set_session(session_id, session)
        return at.format_ussd_response(MAIN_MENU)

    # ── Level 1: menu choice ──────────────────────────────────
    choice = virtual_inputs[0].strip()

    if choice == "0":
        await redis.delete_session(session_id)
        return at.format_ussd_response(
            "Thank you for using vPasi! Safe trading.",
            is_terminal=True,
        )

    if choice not in PROMPTS:
        session["inputs"] = []
        await redis.set_session(session_id, session)
        return at.format_ussd_response(f"Invalid option.\n{MAIN_MENU}")

    if virtual_level == 1:
        await redis.set_session(session_id, session)
        return at.format_ussd_response(PROMPTS[choice])

    # ── Level 2: collect question text ────────────────────────
    if virtual_level == 2:
        await redis.set_session(session_id, session)
        return at.format_ussd_response(
            "Please enter your phone number to receive the answer (e.g. 07...):"
        )

    # ── Level 3: execute research and send SMS ────────────────
    user_input = "*".join(virtual_inputs[1:-1]).strip()
    target_phone = virtual_inputs[-1].strip()

    prefix = QUERY_PREFIXES.get(choice, "")
    query = f"{prefix}{user_input}"

    # Basic phone number formatting for demo (assuming Kenya if starts with 0)
    if target_phone.startswith("0"):
        target_phone = "+254" + target_phone[1:]
    elif not target_phone.startswith("+"):
        target_phone = "+" + target_phone

    # Define a background task to process AI so USSD doesn't timeout
    async def _research_and_send(q: str, p: str):
        ans = await _run_research(q)
        try:
            await at.send_sms(ans, [p])
            logger.info(f"Demo SMS sent to {p}")
        except Exception:
            logger.exception("Failed to send demo SMS")

    asyncio.create_task(_research_and_send(query, target_phone))

    await redis.delete_session(session_id)
    return at.format_ussd_response(
        f"Thank you! Your answer will be sent to {target_phone} via SMS shortly.",
        is_terminal=True
    )
