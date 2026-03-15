"""
WhatsApp handler — routes inbound messages to the research graph.
"""

import logging
import uuid
from typing import Any

from src.graph.research import research_graph
from src.services.africastalking import get_at_client

logger = logging.getLogger(__name__)


async def _run_research(query: str) -> str:
    try:
        result = await research_graph.ainvoke(
            {
                "user_query": query,
                "channel": "whatsapp",
                "search_queries": [],
                "search_results": [],
                "reflection": "",
                "iteration": 0,
                "max_iterations": 2,
                "answer": "",
                "citations": [],
                "timeline": [],
                "error": None,
            },
            config={"configurable": {"thread_id": str(uuid.uuid4())}},
        )
        return result.get("answer", "") or "I couldn't find an answer. Please try rephrasing."
    except Exception:
        logger.exception("WhatsApp research failed")
        return "Sorry, I'm having trouble right now. Please try again shortly."


async def handle_whatsapp_message(payload: dict[str, Any]) -> dict[str, Any]:
    # Africa's Talking WhatsApp payload structure
    entry = payload.get("entry", [{}])[0] if payload.get("entry") else {}
    changes = entry.get("changes", [{}])[0] if entry.get("changes") else {}
    message_data = changes.get("value", {})
    messages = message_data.get("messages", [])

    if not messages:
        logger.warning("WhatsApp webhook with no messages")
        return {"status": "no_messages"}

    message = messages[0]
    sender = message.get("from", "unknown")
    msg_type = message.get("type", "text")

    logger.info("WhatsApp message", extra={"sender": sender, "type": msg_type})

    if msg_type == "text":
        user_text = message.get("text", {}).get("body", "").strip()
        if not user_text:
            return {"status": "empty"}
        response_text = await _run_research(user_text)

    elif msg_type == "location":
        location = message.get("location", {})
        lat, lon = location.get("latitude"), location.get("longitude")
        query = f"Border posts and trade crossing points near coordinates {lat}, {lon} in East Africa"
        response_text = await _run_research(query)

    elif msg_type == "image":
        caption = message.get("image", {}).get("caption", "").strip()
        if caption:
            response_text = await _run_research(caption)
        else:
            response_text = (
                "I received your image. Add a caption with your trade question "
                "and I'll research it for you."
            )
    else:
        response_text = (
            f"I can process text messages and images with captions. "
            f"Send me a trade question to get started."
        )

    # Send reply via AT WhatsApp API
    try:
        at = get_at_client()
        await at.send_whatsapp(response_text, sender)
    except Exception:
        logger.exception("Failed to send WhatsApp reply to %s", sender)

    return {"status": "processed", "recipient": sender, "message_type": msg_type}
