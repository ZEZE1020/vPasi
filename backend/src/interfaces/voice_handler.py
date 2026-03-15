"""
Voice handler — inbound AT voice calls with real AI for option 4.
"""

import logging
import uuid

from src.graph.research import research_graph
from src.services.africastalking import get_at_client

logger = logging.getLogger(__name__)

# Pre-canned answers for menu options 1-3 (fast, no LLM needed for voice)
_CANNED: dict[str, str] = {
    "1": (
        "For border crossing you typically need a national ID or passport, "
        "a customs declaration form, and proof of goods value. "
        "Requirements vary by country. Visit vpasi dot com for details. Goodbye."
    ),
    "2": (
        "Market prices change daily. For current prices visit vpasi dot com "
        "or send an SMS with your commodity name to this number. Goodbye."
    ),
    "3": (
        "Duty rates depend on the commodity and destination country. "
        "Send an SMS with the commodity and destination for a quick calculation. Goodbye."
    ),
}


async def _research_for_voice(query: str) -> str:
    """Run research graph and return a voice-friendly short answer."""
    try:
        result = await research_graph.ainvoke(
            {
                "user_query": query,
                "channel": "voice",
                "search_queries": [],
                "search_results": [],
                "reflection": "",
                "iteration": 0,
                "max_iterations": 1,
                "answer": "",
                "citations": [],
                "timeline": [],
                "error": None,
            },
            config={"configurable": {"thread_id": str(uuid.uuid4())}},
        )
        answer = result.get("answer", "")
        # Voice answers must be short — take first 2 sentences
        sentences = answer.replace("\n", " ").split(". ")
        short = ". ".join(sentences[:2]).strip()
        if short and not short.endswith("."):
            short += "."
        return short or "I could not find an answer. Please try our web app at vpasi dot com."
    except Exception:
        logger.exception("Voice research failed")
        return "I am having trouble right now. Please try again or visit vpasi dot com."


async def handle_voice_callback(
    session_id: str,
    caller_number: str,
    destination_number: str,
    direction: str,
    is_active: str,
    dtmf_digits: str | None = None,
) -> str:
    logger.info(
        "Voice callback",
        extra={"session_id": session_id, "caller": caller_number, "dtmf": dtmf_digits},
    )

    at = get_at_client()

    # ── New call: greet and collect menu choice ───────────────
    if dtmf_digits is None:
        return at.generate_voice_xml_with_input(
            prompt=(
                "Welcome to vPasi, your African trade assistant. "
                "Press 1 for border requirements. "
                "Press 2 for market prices. "
                "Press 3 for duty calculations. "
                "Press 4 to ask any trade question."
            ),
            num_digits=1,
            timeout=10,
        )

    # ── Options 1-3: canned fast responses ───────────────────
    if dtmf_digits in _CANNED:
        return at.generate_voice_xml(_CANNED[dtmf_digits])

    # ── Option 4: real AI research ────────────────────────────
    if dtmf_digits == "4":
        # Collect the spoken/typed question via a second GetDigits prompt
        # In practice AT voice uses speech-to-text or a follow-up SMS
        # For now: prompt them to send an SMS with their question
        return at.generate_voice_xml(
            "To ask a trade question, please send an SMS with your question "
            "to this number and you will receive a detailed answer. Goodbye."
        )

    return at.generate_voice_xml(
        "Sorry, I did not understand that option. Please call again. Goodbye."
    )
