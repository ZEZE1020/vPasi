"""
Google Vertex AI wrapper.

Provides async access to Gemini Pro for reasoning and conversation,
and Vector Search for trade-related document retrieval.
"""

import logging

import vertexai
from vertexai.generative_models import GenerativeModel

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


class VertexAIClient:
    """
    Wrapper for Google Vertex AI Generative Models.

    Handles initialization, session-aware conversations, and
    channel-specific response formatting.
    """

    def __init__(self) -> None:
        vertexai.init(
            project=settings.GOOGLE_PROJECT_ID,
            location=settings.GOOGLE_LOCATION,
        )
        self.model = GenerativeModel(
            model_name=settings.VERTEX_AI_MODEL,
            system_instruction=VPASI_SYSTEM_PROMPT,
        )
        logger.info(
            "Vertex AI initialized",
            extra={
                "project": settings.GOOGLE_PROJECT_ID,
                "model": settings.VERTEX_AI_MODEL,
            },
        )

    async def generate_response(
        self,
        user_message: str,
        *,
        channel: str = "ussd",
        conversation_history: list[dict[str, str]] | None = None,
    ) -> str:
        """
        Generate a response from Gemini Pro.

        Args:
            user_message: The user's latest input.
            channel: One of "ussd", "voice", "whatsapp" — controls response length.
            conversation_history: Prior turns for multi-turn context.

        Returns:
            The model's text response, formatted for the given channel.
        """
        # Build content parts from conversation history
        contents: list[str] = []
        if conversation_history:
            for turn in conversation_history:
                contents.append(f"{turn['role']}: {turn['content']}")

        # Channel-specific instruction
        channel_instructions = {
            "ussd": "\n[CHANNEL: USSD — respond in under 160 characters, plain text only]",
            "voice": "\n[CHANNEL: Voice — respond conversationally, 2-3 sentences max]",
            "whatsapp": "\n[CHANNEL: WhatsApp — you may use formatting and emojis]",
        }
        channel_hint = channel_instructions.get(channel, "")
        full_message = f"{user_message}{channel_hint}"
        contents.append(full_message)

        try:
            response = await self.model.generate_content_async(
                contents=contents,
                generation_config={
                    "max_output_tokens": 256 if channel == "ussd" else 1024,
                    "temperature": 0.7,
                    "top_p": 0.9,
                },
            )

            fallback = "I couldn't process that. Please try again."
            result = response.text.strip() if response.text else fallback
            logger.info(
                "Vertex AI response generated",
                extra={"channel": channel, "response_length": len(result)},
            )
            return result

        except Exception:
            logger.exception("Vertex AI generation failed")
            return "Sorry, I'm having trouble right now. Please try again shortly."


# Lazy singleton — avoids import-time GCP initialization
_vertex_client: VertexAIClient | None = None


def get_vertex_client() -> VertexAIClient:
    """Return the Vertex AI client singleton, creating it on first call."""
    global _vertex_client
    if _vertex_client is None:
        _vertex_client = VertexAIClient()
    return _vertex_client
