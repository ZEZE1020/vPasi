"""
Research API routes — REST endpoints for the web UI research agent.
"""

import json
import logging
import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from src.graph.research import research_graph
from src.models.session import ChatSession
from src.safety.guards import run_input_guards, run_output_guards

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["research"])


# ── Pydantic schemas ─────────────────────────────────────────────

class ResearchRequest(BaseModel):
    query: str
    session_id: str | None = None


class Citation(BaseModel):
    title: str
    url: str
    snippet: str


class ResearchResponse(BaseModel):
    id: str
    query: str
    answer: str
    citations: list[Citation]
    timeline: list[dict[str, Any]]
    token_usage: dict[str, int]


class SessionSummary(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str
    message_count: int


class SessionDetail(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str
    messages: list[dict[str, Any]]


# ── DB helper ────────────────────────────────────────────────────

def _get_session_factory(request: Request) -> async_sessionmaker | None:
    engine = getattr(request.app.state, "db_engine", None)
    if engine is None:
        return None
    return async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


# ── Research endpoint ────────────────────────────────────────────

@router.post("/research", response_model=ResearchResponse)
async def submit_research(
    request: Request,
    body: ResearchRequest,
) -> ResearchResponse:
    query = body.query
    research_id = str(uuid.uuid4())

    logger.info("Research query submitted", extra={"id": research_id, "query": query})

    safety_report = run_input_guards(query)
    if not safety_report.passed:
        failed = [g.details for g in safety_report.failed_guards]
        return ResearchResponse(
            id=research_id, query=query,
            answer="Your query could not be processed: " + "; ".join(failed),
            citations=[],
            timeline=[{"step": "safety_check", "timestamp": "", "detail": f"Blocked: {', '.join(failed)}"}],
            token_usage={"input_tokens": 0, "output_tokens": 0, "total_tokens": 0},
        )

    try:
        thread_id = body.session_id or research_id
        result = await research_graph.ainvoke({
            "user_query": query, "channel": "web",
            "search_queries": [], "search_results": [],
            "reflection": "", "iteration": 0, "max_iterations": 3,
            "answer": "", "citations": [], "timeline": [], "token_usage": {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0}, "error": None,
        }, config={"configurable": {"thread_id": thread_id}})

        answer = result.get("answer", "No answer generated.")
        raw_citations = result.get("citations", [])
        timeline = result.get("timeline", [])
        token_usage = result.get("token_usage", {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0})

        output_report = run_output_guards(answer, raw_citations)
        if not output_report.passed:
            failed_out = [g.details for g in output_report.failed_guards]
            answer += "\n\n[Safety notice: " + "; ".join(failed_out) + "]"

        citations = [Citation(**{k: c.get(k, "") for k in ("title", "url", "snippet")}) for c in raw_citations]

    except Exception:
        logger.exception("Research graph execution failed")
        answer = "The research pipeline encountered an error. Please try again."
        citations = []
        timeline = [{"step": "error", "timestamp": "", "detail": "Research pipeline failed"}]
        token_usage = {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0}

    # Persist to session in Postgres
    factory = _get_session_factory(request)
    if factory and body.session_id:
        async with factory() as db:
            session = await db.get(ChatSession, body.session_id)
            if session:
                msgs = list(session.messages)
                msgs.append({"role": "user", "content": query, "id": research_id, "timestamp": datetime.now(UTC).isoformat()})
                msgs.append({
                    "role": "assistant", "content": answer, "id": str(uuid.uuid4()),
                    "timestamp": datetime.now(UTC).isoformat(),
                    "citations": [c.model_dump() for c in citations],
                    "timeline": timeline,
                })
                session.messages = msgs
                session.updated_at = datetime.now(UTC)
                if session.title == "New research" and query:
                    session.title = query[:60] + ("…" if len(query) > 60 else "")
                await db.commit()

    return ResearchResponse(
        id=research_id,
        query=query,
        answer=answer,
        citations=citations,
        timeline=timeline,
        token_usage=token_usage,
    )


@router.get("/research/{research_id}", response_model=ResearchResponse)
async def get_research(research_id: str) -> ResearchResponse:
    return ResearchResponse(
        id=research_id, query="", answer="Use /api/sessions/{id} to retrieve full session history.",
        citations=[], timeline=[], token_usage={"input_tokens": 0, "output_tokens": 0, "total_tokens": 0},
    )


# ── Session endpoints ────────────────────────────────────────────

@router.post("/sessions", response_model=SessionSummary)
async def create_session(request: Request) -> SessionSummary:
    """Create a new empty chat session."""
    factory = _get_session_factory(request)
    session = ChatSession(id=str(uuid.uuid4()), title="New research", messages=[])

    if factory:
        async with factory() as db:
            db.add(session)
            await db.commit()
            await db.refresh(session)

    return SessionSummary(
        id=session.id,
        title=session.title,
        created_at=session.created_at.isoformat(),
        updated_at=session.updated_at.isoformat(),
        message_count=0,
    )


@router.get("/sessions", response_model=list[SessionSummary])
async def list_sessions(request: Request) -> list[SessionSummary]:
    """List all sessions ordered by most recently updated."""
    factory = _get_session_factory(request)
    if not factory:
        return []

    async with factory() as db:
        result = await db.execute(
            select(ChatSession).order_by(ChatSession.updated_at.desc()).limit(100)
        )
        sessions = result.scalars().all()

    return [
        SessionSummary(
            id=s.id,
            title=s.title,
            created_at=s.created_at.isoformat(),
            updated_at=s.updated_at.isoformat(),
            message_count=len(s.messages),
        )
        for s in sessions
    ]


@router.get("/sessions/{session_id}", response_model=SessionDetail)
async def get_session(session_id: str, request: Request) -> SessionDetail:
    """Get full message history for a session."""
    factory = _get_session_factory(request)
    if not factory:
        return SessionDetail(id=session_id, title="", created_at="", updated_at="", messages=[])

    async with factory() as db:
        session = await db.get(ChatSession, session_id)

    if not session:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Session not found")

    return SessionDetail(
        id=session.id,
        title=session.title,
        created_at=session.created_at.isoformat(),
        updated_at=session.updated_at.isoformat(),
        messages=session.messages,
    )


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, request: Request) -> dict[str, str]:
    """Delete a session and all its messages."""
    factory = _get_session_factory(request)
    if factory:
        async with factory() as db:
            await db.execute(delete(ChatSession).where(ChatSession.id == session_id))
            await db.commit()
    return {"status": "deleted"}


# ── Suggestions endpoint ────────────────────────────────────────

_FALLBACK_SUGGESTIONS = [
    "What are the import duties on textiles from Tanzania to Kenya?",
    "Compare maize prices across East African markets this week",
    "Documents needed for cross-border trade between Uganda and DRC",
    "Latest COMESA trade regulations for agricultural exports",
    "How do I register as a cross-border trader in Rwanda?",
    "Current exchange rates and their impact on Uganda-Kenya trade",
    "What goods are restricted at the Tanzania-Zambia border?",
    "EAC common external tariff rates for electronics",
]


@router.get("/suggestions", response_model=list[str])
async def get_suggestions(request: Request) -> list[str]:
    """Return 4 dynamic suggestions — recent queries first, padded with fallbacks."""
    factory = _get_session_factory(request)
    recent: list[str] = []

    if factory:
        try:
            async with factory() as db:
                result = await db.execute(
                    select(ChatSession)
                    .order_by(ChatSession.updated_at.desc())
                    .limit(25)
                )
                sessions = result.scalars().all()

            seen: set[str] = set()
            for s in sessions:
                messages = s.messages if isinstance(s.messages, list) else []
                if not messages:
                    continue

                for msg in messages:
                    if msg.get("role") == "user":
                        q = msg.get("content", "").strip()
                        if q and q not in seen:
                            seen.add(q)
                            recent.append(q[:80] + ("…" if len(q) > 80 else ""))
                        if len(recent) >= 2:
                            break
                if len(recent) >= 2:
                    break
        except Exception:
            logger.exception("Failed to load dynamic suggestions, using fallback suggestions")

    # Fill remaining slots with non-duplicate fallbacks
    import random
    pool = [f for f in _FALLBACK_SUGGESTIONS if f not in recent]
    random.shuffle(pool)
    suggestions = (recent + pool)[:4]
    return suggestions


# ── Streaming endpoint ───────────────────────────────────────────

def _serialize_step(node_name: str, state_update: dict) -> dict:
    if node_name == "generate_queries":
        return {"search_queries": state_update.get("search_queries", [])}
    if node_name == "web_search":
        results = state_update.get("search_results", [])
        return {"result_count": len(results), "results_preview": [{"title": r["title"], "url": r["url"]} for r in results[:5]]}
    if node_name == "reflect":
        return {"reflection": state_update.get("reflection", ""), "iteration": state_update.get("iteration", 0)}
    if node_name == "synthesize":
        return {"answer": state_update.get("answer", ""), "citations": state_update.get("citations", [])}
    return {}


@router.post("/research/stream")
async def stream_research(request: Request, body: ResearchRequest) -> StreamingResponse:
    query = body.query
    research_id = str(uuid.uuid4())

    logger.info("Streaming research query submitted", extra={"id": research_id, "query": query})

    safety_report = run_input_guards(query)
    if not safety_report.passed:
        failed = [g.details for g in safety_report.failed_guards]

        async def error_stream():
            yield f"event: error\ndata: {json.dumps({'message': '; '.join(failed)})}\n\n"

        return StreamingResponse(error_stream(), media_type="text/event-stream")

    async def event_stream():
        try:
            thread_id = body.session_id or research_id
            initial_state = {
                "user_query": query, "channel": "web",
                "search_queries": [], "search_results": [],
                "reflection": "", "iteration": 0, "max_iterations": 3,
                "answer": "", "citations": [], "timeline": [],
                "token_usage": {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0},
                "error": None,
            }

            final_state: dict[str, Any] = {}
            async for chunk in research_graph.astream(
                initial_state,
                config={"configurable": {"thread_id": thread_id}},
            ):
                for node_name, state_update in chunk.items():
                    timeline_entries = state_update.get("timeline", [])
                    detail = timeline_entries[-1]["detail"] if timeline_entries else ""
                    event_data = {"node": node_name, "detail": detail, "data": _serialize_step(node_name, state_update)}
                    yield f"event: step\ndata: {json.dumps(event_data)}\n\n"
                    final_state.update(state_update)

            answer = final_state.get("answer", "")
            citations = final_state.get("citations", [])
            output_report = run_output_guards(answer, citations)
            if not output_report.passed:
                failed_out = [g.details for g in output_report.failed_guards]
                answer += "\n\n[Safety notice: " + "; ".join(failed_out) + "]"

            # Persist to session
            factory = _get_session_factory(request)
            if factory and body.session_id:
                async with factory() as db:
                    session = await db.get(ChatSession, body.session_id)
                    if session:
                        msgs = list(session.messages)
                        msgs.append({"role": "user", "content": query, "id": research_id, "timestamp": datetime.now(UTC).isoformat()})
                        msgs.append({
                            "role": "assistant", "content": answer, "id": str(uuid.uuid4()),
                            "timestamp": datetime.now(UTC).isoformat(),
                            "citations": citations, "timeline": final_state.get("timeline", []),
                        })
                        session.messages = msgs
                        session.updated_at = datetime.now(UTC)
                        if session.title == "New research" and query:
                            session.title = query[:60] + ("…" if len(query) > 60 else "")
                        await db.commit()

            done_data = {
                "id": research_id,
                "answer": answer,
                "citations": citations,
                "token_usage": final_state.get("token_usage", {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0}),
            }
            yield f"event: done\ndata: {json.dumps(done_data)}\n\n"

        except Exception as exc:
            logger.exception("Streaming research failed")
            yield f"event: error\ndata: {json.dumps({'message': str(exc)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
