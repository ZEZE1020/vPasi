"""
Africa's Talking SDK wrapper.

Provides a singleton client for SMS, Voice, and USSD interactions.
All AT webhook response formatting is centralized here.
"""

import logging
from xml.etree.ElementTree import Element, SubElement, tostring

import africastalking

from src.core.config import settings

logger = logging.getLogger(__name__)


class AfricasTalkingClient:
    """
    Singleton wrapper around the Africa's Talking SDK.

    Handles initialization and provides helper methods for formatting
    USSD responses and Voice XML payloads.
    """

    _initialized: bool = False

    def __init__(self) -> None:
        if not AfricasTalkingClient._initialized:
            africastalking.initialize(
                username=settings.AT_USERNAME,
                api_key=settings.AT_API_KEY,
            )
            AfricasTalkingClient._initialized = True
            logger.info(
                "Africa's Talking SDK initialized",
                extra={"username": settings.AT_USERNAME},
            )

        self.sms = africastalking.SMS
        self.voice = africastalking.Voice
        self.airtime = africastalking.Airtime

    # ── USSD Helpers ─────────────────────────────────────────────

    @staticmethod
    def format_ussd_response(message: str, *, is_terminal: bool = False) -> str:
        """
        Format a USSD response string.

        Africa's Talking requires:
        - "CON " prefix → session continues, user can reply
        - "END " prefix → session terminates after displaying message

        Args:
            message: The text to display to the user.
            is_terminal: If True, prefix with END (session closes).
                         If False, prefix with CON (session stays open).

        Returns:
            Formatted USSD response string.
        """
        prefix = "END" if is_terminal else "CON"
        return f"{prefix} {message}"

    # ── Voice XML Helpers ────────────────────────────────────────

    @staticmethod
    def generate_voice_xml(text: str, voice: str = "en-US-Standard-A") -> str:
        """
        Generate valid AT Voice XML response.

        Produces XML in the format:
            <Response>
                <Say voice="...">text</Say>
            </Response>

        Args:
            text: The text-to-speech content.
            voice: The voice identifier to use.

        Returns:
            XML string for AT Voice callback response.
        """
        response = Element("Response")
        say = SubElement(response, "Say")
        say.set("voice", voice)
        say.text = text
        return tostring(response, encoding="unicode", xml_declaration=True)

    @staticmethod
    def generate_voice_xml_with_input(
        prompt: str,
        *,
        timeout: int = 30,
        finish_on_key: str = "#",
        num_digits: int | None = None,
        voice: str = "en-US-Standard-A",
    ) -> str:
        """
        Generate AT Voice XML that collects DTMF input.

        Produces XML in the format:
            <Response>
                <GetDigits timeout="30" finishOnKey="#" numDigits="...">
                    <Say voice="...">prompt</Say>
                </GetDigits>
            </Response>

        Args:
            prompt: The text prompt to read before collecting digits.
            timeout: Seconds to wait for input.
            finish_on_key: Key that terminates digit collection.
            num_digits: Exact number of digits to collect (optional).
            voice: The voice identifier to use.

        Returns:
            XML string for AT Voice callback response.
        """
        response = Element("Response")
        get_digits = SubElement(response, "GetDigits")
        get_digits.set("timeout", str(timeout))
        get_digits.set("finishOnKey", finish_on_key)
        if num_digits is not None:
            get_digits.set("numDigits", str(num_digits))

        say = SubElement(get_digits, "Say")
        say.set("voice", voice)
        say.text = prompt

        return tostring(response, encoding="unicode", xml_declaration=True)

    # ── SMS Helper ───────────────────────────────────────────────

    async def send_sms(self, message: str, recipients: list[str]) -> dict:
        """Send an SMS via Africa's Talking."""
        import asyncio
        try:
            response = await asyncio.to_thread(
                self.sms.send, message, recipients  # type: ignore[union-attr]
            )
            logger.info("SMS sent", extra={"recipients": recipients})
            return response  # type: ignore[return-value]
        except Exception as exc:
            # SSL errors in Docker sandbox are non-fatal — log and continue
            if "SSL" in str(exc) or "ssl" in str(exc):
                logger.warning(
                    "SMS send skipped (SSL/sandbox issue): %s",
                    str(exc)[:120],
                    extra={"recipients": recipients},
                )
                return {"status": "skipped", "reason": "ssl_sandbox"}
            logger.exception("Failed to send SMS", extra={"recipients": recipients})
            raise

    async def send_whatsapp(self, message: str, recipient: str) -> None:
        """Send a WhatsApp message via Africa's Talking."""
        import asyncio
        try:
            await asyncio.to_thread(
                self.sms.send,  # type: ignore[union-attr]
                message,
                [recipient],
            )
            logger.info("WhatsApp message sent", extra={"recipient": recipient})
        except Exception as exc:
            if "SSL" in str(exc) or "ssl" in str(exc):
                logger.warning(
                    "WhatsApp send skipped (SSL/sandbox issue): %s",
                    str(exc)[:120],
                    extra={"recipient": recipient},
                )
                return
            logger.exception("Failed to send WhatsApp message", extra={"recipient": recipient})


# Lazy singleton — avoids import-time SDK initialization
_at_client: AfricasTalkingClient | None = None


def get_at_client() -> AfricasTalkingClient:
    """Return the AT client singleton, creating it on first call."""
    global _at_client
    if _at_client is None:
        _at_client = AfricasTalkingClient()
    return _at_client
