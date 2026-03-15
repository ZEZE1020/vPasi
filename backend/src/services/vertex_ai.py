"""
Google Vertex AI wrapper for channel-specific responses (USSD, Voice, WhatsApp).

Uses ChatVertexAI (same as the research graph) for consistency,
with channel-aware formatting for short-form interactions.
"""

import logging
from functools import lru_cache

from langchain_google_vertexai import ChatVertexAI

from src.core.config import settings

logger = logging.getLogger(__name__)

# System prompt grounding the AI as a trade assistant
VPASI_SYSTEM_PROMPT = """\
You are vPasi, an AI-powered trade assistant for informal cross-border traders in Africa.

Your responsibilities:
- Help traders understand import/export regulations, tariffs, and documentation requirements.
- Provide real-time market price information when available.
- Guide users through customs procedures at key African border posts.
- Communicate clearly and concisely — many users interact via USSD or voice,
  so keep responses short.
- Support Swahili, English, and French. Detect the user's language and
  respond accordingly.
- Always be respectful, patient, and culturally aware.
- If you don't know something, say so clearly and suggest where the trader can find help.

Keep responses under 160 characters when the channel is USSD.
For voice, use natural conversational language.
For WhatsApp, you may use richer formatting.
"""

CHANNEL_INSTRUCTIONS = {
    "ussd": "\n[CHANNEL: USSD — respond in under 160 characters, plain text only]",
    "voice": "\n[CHANNEL: Voice — respond conversationally, 2-3 sentences max]",
    "whatsapp": "\n[CHANNEL: WhatsApp — you may use formatting and emojis]",
}


@lru_cache(maxsize=1)
def _get_channel_llm() -> ChatVertexAI:
    """Cached ChatVertexAI for channel interactions (USSD/Voice/WhatsApp)."""
    return ChatVertexAI(
        model=settings.VERTEX_AI_MODEL,
        project=settings.GOOGLE_PROJECT_ID,
        location=settings.GOOGLE_LOCATION,
        temperature=0.7,
        max_output_tokens=256,
        system_instruction=VPASI_SYSTEM_PROMPT,
    )


async def generate_channel_response(
    user_message: str,
    *,
    channel: str = "ussd",
    conversation_history: list[dict[str, str]] | None = None,
) -> str:
    """
    Generate a response for a channel interaction (USSD, Voice, WhatsApp).

    Args:
        user_message: The user's latest input.
        channel: One of "ussd", "voice", "whatsapp" — controls response length.
        conversation_history: Prior turns for multi-turn context.

    Returns:
        The model's text response, formatted for the given channel.
    """
    channel_hint = CHANNEL_INSTRUCTIONS.get(channel, "")
    full_message = f"{user_message}{channel_hint}"

    try:
        llm = _get_channel_llm()
        response = await llm.ainvoke(full_message)
        result = response.content.strip() if response.content else ""
        if not result:
            result = "I couldn't process that. Please try again."
        logger.info(
            "Channel response generated",
            extra={"channel": channel, "response_length": len(result)},
        )
        return result
    except Exception:
        logger.exception("Channel LLM generation failed")
        return "Sorry, I'm having trouble right now. Please try again shortly."
