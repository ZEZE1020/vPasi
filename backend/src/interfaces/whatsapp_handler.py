"""
WhatsApp handler — business logic for WhatsApp webhook messages.

Processes text, image, and location messages from the WhatsApp Business API
via Africa's Talking.
"""

import logging
from typing import Any

logger = logging.getLogger(__name__)


async def handle_whatsapp_message(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Process an inbound WhatsApp message from Africa's Talking.

    Supports text, image, and location message types.

    Args:
        payload: The JSON payload from the AT WhatsApp webhook.

    Returns:
        Response dict to send back to the user.
    """
    # Extract common fields from AT WhatsApp payload
    entry = payload.get("entry", [{}])[0] if payload.get("entry") else {}
    changes = entry.get("changes", [{}])[0] if entry.get("changes") else {}
    message_data = changes.get("value", {})

    messages = message_data.get("messages", [])
    if not messages:
        logger.warning("WhatsApp webhook with no messages", extra={"payload": payload})
        return {"status": "no_messages"}

    message = messages[0]
    sender = message.get("from", "unknown")
    msg_type = message.get("type", "text")

    logger.info(
        "WhatsApp message received",
        extra={
            "sender": sender,
            "type": msg_type,
            "message_id": message.get("id"),
        },
    )

    # ── Handle by message type ───────────────────────────────
    if msg_type == "text":
        user_text = message.get("text", {}).get("body", "")
        # TODO: Route to vertex_client.generate_response(channel="whatsapp")
        response_text = (
            f" *vPasi Trade Assistant*\n\n"
            f"You said: _{user_text}_\n\n"
            f"This feature is coming soon! "
            f"For now, try our USSD service by dialing *483#."
        )

    elif msg_type == "image":
        # Image messages can include trade documents, receipts, etc.
        caption = message.get("image", {}).get("caption", "No caption")
        response_text = (
            f"📷 I received your image"
            f"{f' with caption: {caption}' if caption != 'No caption' else ''}.\n\n"
            f"Document analysis is coming soon!"
        )

    elif msg_type == "location":
        location = message.get("location", {})
        lat = location.get("latitude")
        lon = location.get("longitude")
        response_text = (
            f"📍 Got your location ({lat}, {lon}).\n\n"
            f"I'll find the nearest border post for you soon!"
        )

    else:
        response_text = (
            f"I received a {msg_type} message, but I can only process "
            f"text, images, and locations right now."
        )

    return {
        "status": "processed",
        "recipient": sender,
        "response": response_text,
        "message_type": msg_type,
    }
