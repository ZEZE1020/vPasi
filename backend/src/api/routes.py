"""
API routes — FastAPI routers exposing webhook endpoints.

All Africa's Talking callbacks are received here, validated,
and dispatched to the appropriate interface handler.
"""

import logging
import uuid
from typing import Any

from fastapi import APIRouter, Form, Request, Response

from src.core.security import ATSignatureDep
from src.interfaces.ussd_handler import handle_ussd_request
from src.interfaces.voice_handler import handle_voice_callback
from src.interfaces.whatsapp_handler import handle_whatsapp_message
from src.services.africastalking import get_at_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


# ── USSD Webhook ─────────────────────────────────────────────────


@router.post("/ussd")
async def ussd_webhook(
    request: Request,
    _sig: ATSignatureDep,
    session_id: str = Form(..., alias="sessionId"),
    service_code: str = Form(..., alias="serviceCode"),
    phone_number: str = Form(..., alias="phoneNumber"),
    text: str = Form(""),
) -> Response:
    """
    Africa's Talking USSD callback endpoint.

    AT sends form-encoded POST data with the user's USSD session state.
    Must return a plain text response prefixed with CON or END.
    """
    logger.info(
        "USSD webhook hit",
        extra={
            "session_id": session_id,
            "phone": phone_number,
            "text": text,
        },
    )

    redis = request.app.state.redis
    response_text = await handle_ussd_request(
        session_id=session_id,
        service_code=service_code,
        phone_number=phone_number,
        text=text,
        redis=redis,
    )

    return Response(content=response_text, media_type="text/plain")


# ── Voice Webhook ────────────────────────────────────────────────


@router.post("/voice")
async def voice_webhook(
    _sig: ATSignatureDep,
    session_id: str = Form(..., alias="sessionId"),
    caller_number: str = Form("", alias="callerNumber"),
    destination_number: str = Form("", alias="destinationNumber"),
    direction: str = Form("inbound"),
    is_active: str = Form("1", alias="isActive"),
    dtmf_digits: str | None = Form(None, alias="dtmfDigits"),
) -> Response:
    """
    Africa's Talking Voice callback endpoint.

    AT sends form-encoded POST data for inbound calls and DTMF events.
    Must return valid Voice XML (application/xml).
    """
    logger.info(
        "Voice webhook hit",
        extra={
            "session_id": session_id,
            "caller": caller_number,
            "dtmf": dtmf_digits,
        },
    )

    xml_response = await handle_voice_callback(
        session_id=session_id,
        caller_number=caller_number,
        destination_number=destination_number,
        direction=direction,
        is_active=is_active,
        dtmf_digits=dtmf_digits,
    )

    return Response(content=xml_response, media_type="application/xml")


# ── WhatsApp Webhook ─────────────────────────────────────────────


@router.post("/whatsapp")
async def whatsapp_webhook(
    request: Request,
    _sig: ATSignatureDep,
) -> dict[str, Any]:
    """
    Africa's Talking / WhatsApp Business API webhook.

    Receives JSON payloads for incoming WhatsApp messages.
    """
    payload = await request.json()

    logger.info(
        "WhatsApp webhook hit",
        extra={"payload_keys": list(payload.keys())},
    )

    result = await handle_whatsapp_message(payload)
    return result


# ── SMS Webhook ──────────────────────────────────────────────────


@router.post("/sms")
async def sms_webhook(
    _sig: ATSignatureDep,
    from_: str = Form("", alias="from"),
    to: str = Form("", alias="to"),
    text: str = Form(""),
    date: str = Form("", alias="date"),
    sms_id: str = Form("", alias="id"),
) -> dict[str, Any]:
    """
    Africa's Talking SMS inbound webhook.

    Receives form-encoded POST data for incoming SMS messages.
    Processes the query and sends a reply via AT SMS API.
    """
    logger.info(
        "SMS webhook hit",
        extra={
            "from": from_,
            "to": to,
            "text": text,
            "sms_id": sms_id,
        },
    )

    if not text.strip():
        return {
            "status": "ignored",
            "reason": "empty message",
        }

    # Run the research graph for SMS queries
    from src.graph.research import research_graph

    try:
        result = await research_graph.ainvoke({
            "user_query": text,
            "channel": "sms",
            "search_queries": [],
            "search_results": [],
            "reflection": "",
            "iteration": 0,
            "max_iterations": 2,  # Fewer iterations for SMS
            "answer": "",
            "citations": [],
            "timeline": [],
            "error": None,
        }, config={"configurable": {"thread_id": str(uuid.uuid4())}})

        answer = result.get("answer", "Could not process your query.")
        # Truncate for SMS (160 char limit per segment)
        if len(answer) > 450:
            answer = answer[:447] + "..."

    except Exception:
        logger.exception("SMS research failed")
        answer = "Sorry, I could not process your request right now."

    # Send reply via Africa's Talking SMS
    reply_sent = False
    try:
        at_client = get_at_client()
        await at_client.send_sms(answer, [from_])
        reply_sent = True
    except Exception:
        logger.exception("Failed to send SMS reply")

    return {
        "status": "processed",
        "from": from_,
        "text": text,
        "reply_sent": reply_sent,
    }
