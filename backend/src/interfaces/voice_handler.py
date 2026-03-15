"""
Voice handler — business logic for inbound AT voice calls.

Generates Voice XML responses for text-to-speech and DTMF input collection.
"""

import logging

from src.services.africastalking import get_at_client

logger = logging.getLogger(__name__)


async def handle_voice_callback(
    session_id: str,
    caller_number: str,
    destination_number: str,
    direction: str,
    is_active: str,
    dtmf_digits: str | None = None,
) -> str:
    """
    Process an inbound voice call callback from Africa's Talking.

    Args:
        session_id: AT voice session identifier.
        caller_number: Caller's phone number.
        destination_number: The AT virtual number called.
        direction: "inbound" or "outbound".
        is_active: Whether the call is currently active.
        dtmf_digits: Any DTMF digits the caller pressed.

    Returns:
        AT-compatible Voice XML response string.
    """
    logger.info(
        "Voice callback received",
        extra={
            "session_id": session_id,
            "caller": caller_number,
            "direction": direction,
            "dtmf_digits": dtmf_digits,
        },
    )

    # ── New call — greet and collect menu choice ─────────────
    if dtmf_digits is None:
        return get_at_client().generate_voice_xml_with_input(
            prompt=(
                "Welcome to vPasi, your trade assistant. "
                "Press 1 for border requirements. "
                "Press 2 for market prices. "
                "Press 3 for duty calculations. "
                "Press 4 to ask a question."
            ),
            num_digits=1,
            timeout=10,
        )

    # ── Handle DTMF selections ──────────────────────────────
    menu_responses = {
        "1": "You selected border requirements. This feature is coming soon. Goodbye.",
        "2": "You selected market prices. This feature is coming soon. Goodbye.",
        "3": "You selected duty calculations. This feature is coming soon. Goodbye.",
        "4": "You selected ask a question. This feature is coming soon. Goodbye.",
    }

    response_text = menu_responses.get(
        dtmf_digits,
        "Sorry, I didn't understand that option. Please call again. Goodbye.",
    )

    # TODO: Integrate vertex_client.generate_response(channel="voice") here
    return get_at_client().generate_voice_xml(response_text)
