"""
Research API routes — REST endpoints for the web UI research agent.
"""

import json
import logging
import uuid
from typing import Any

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from src.graph.research import research_graph
from src.safety.guards import run_input_guards, run_output_guards

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["research"])


class ResearchRequest(BaseModel):
    """Request body for a research query."""

    query: str


class Citation(BaseModel):
    """A citation from a search result."""

    title: str
    url: str
    snippet: str


class ResearchResponse(BaseModel):
    """Response body for a completed research query."""

    id: str
    query: str
    answer: str
    citations: list[Citation]
    timeline: list[dict[str, Any]]


@router.post("/research", response_model=ResearchResponse)
async def submit_research(
    request: ResearchRequest,
) -> ResearchResponse:
    """
    Submit a research query to the LangGraph agent.

    The agent generates search queries, performs web research,
    reflects on results, and synthesizes an answer with citations.
    """
    query = request.query
    research_id = str(uuid.uuid4())

    logger.info(
        "Research query submitted",
        extra={"id": research_id, "query": query},
    )

    # Run input safety guards
    safety_report = run_input_guards(query)
    if not safety_report.passed:
        failed = [g.details for g in safety_report.failed_guards]
        logger.warning(
            "Input safety check failed",
            extra={"guards": failed},
        )
        return ResearchResponse(
            id=research_id,
            query=query,
            answer=(
                "Your query could not be processed: "
                f"{'; '.join(failed)}"
            ),
            citations=[],
            timeline=[{
                "step": "safety_check",
                "timestamp": "",
                "detail": f"Blocked: {', '.join(failed)}",
            }],
        )

    # Invoke the LangGraph research graph
    try:
        result = await research_graph.ainvoke({
            "user_query": query,
            "channel": "web",
            "search_queries": [],
            "search_results": [],
            "reflection": "",
            "iteration": 0,
            "max_iterations": 3,
            "answer": "",
            "citations": [],
            "timeline": [],
            "error": None,
        })

        answer = result.get("answer", "No answer generated.")
        raw_citations = result.get("citations", [])
        timeline = result.get("timeline", [])

        # Run output safety guards
        output_report = run_output_guards(answer, raw_citations)
        if not output_report.passed:
            failed_out = [g.details for g in output_report.failed_guards]
            logger.warning(
                "Output safety check flagged",
                extra={"guards": failed_out},
            )
            answer += (
                "\n\n[Safety notice: "
                + "; ".join(failed_out)
                + "]"
            )

        citations = [
            Citation(
                title=c.get("title", ""),
                url=c.get("url", ""),
                snippet=c.get("snippet", ""),
            )
            for c in raw_citations
        ]

    except Exception:
        logger.exception("Research graph execution failed")
        answer = (
            "The research pipeline encountered an error. "
            "Please try again."
        )
        citations = []
        timeline = [{
            "step": "error",
            "timestamp": "",
            "detail": "Research pipeline failed",
        }]

    return ResearchResponse(
        id=research_id,
        query=query,
        answer=answer,
        citations=citations,
        timeline=timeline,
    )


@router.get(
    "/research/{research_id}",
    response_model=ResearchResponse,
)
async def get_research(research_id: str) -> ResearchResponse:
    """Retrieve a research result by ID."""
    logger.info(
        "Research result requested",
        extra={"id": research_id},
    )

    # TODO: Look up from Postgres persistence
    return ResearchResponse(
        id=research_id,
        query="",
        answer="Result lookup requires Postgres persistence.",
        citations=[],
        timeline=[],
    )


def _serialize_step(node_name: str, state_update: dict) -> dict:
    """Select relevant fields per node to keep SSE payloads small."""
    if node_name == "generate_queries":
        return {"search_queries": state_update.get("search_queries", [])}
    if node_name == "web_search":
        results = state_update.get("search_results", [])
        return {
            "result_count": len(results),
            "results_preview": [
                {"title": r["title"], "url": r["url"]} for r in results[:5]
            ],
        }
    if node_name == "reflect":
        return {
            "reflection": state_update.get("reflection", ""),
            "iteration": state_update.get("iteration", 0),
        }
    if node_name == "synthesize":
        return {
            "answer": state_update.get("answer", ""),
            "citations": state_update.get("citations", []),
        }
    return {}


@router.post("/research/stream")
async def stream_research(request: ResearchRequest) -> StreamingResponse:
    """
    Stream research results as Server-Sent Events.

    Emits events as each pipeline step completes, giving the frontend
    real-time progress updates.
    """
    query = request.query
    research_id = str(uuid.uuid4())

    logger.info(
        "Streaming research query submitted",
        extra={"id": research_id, "query": query},
    )

    # Run input safety guards before streaming
    safety_report = run_input_guards(query)
    if not safety_report.passed:
        failed = [g.details for g in safety_report.failed_guards]

        async def error_stream():
            yield (
                f"event: error\n"
                f"data: {json.dumps({'message': '; '.join(failed)})}\n\n"
            )

        return StreamingResponse(
            error_stream(),
            media_type="text/event-stream",
        )

    async def event_stream():
        try:
            initial_state = {
                "user_query": query,
                "channel": "web",
                "search_queries": [],
                "search_results": [],
                "reflection": "",
                "iteration": 0,
                "max_iterations": 3,
                "answer": "",
                "citations": [],
                "timeline": [],
                "error": None,
            }

            final_state: dict[str, Any] = {}
            async for chunk in research_graph.astream(initial_state):
                for node_name, state_update in chunk.items():
                    timeline_entries = state_update.get("timeline", [])
                    detail = (
                        timeline_entries[-1]["detail"]
                        if timeline_entries
                        else ""
                    )

                    event_data = {
                        "node": node_name,
                        "detail": detail,
                        "data": _serialize_step(node_name, state_update),
                    }
                    yield (
                        f"event: step\n"
                        f"data: {json.dumps(event_data)}\n\n"
                    )
                    final_state.update(state_update)

            # Run output safety guards
            answer = final_state.get("answer", "")
            citations = final_state.get("citations", [])
            output_report = run_output_guards(answer, citations)
            if not output_report.passed:
                failed_out = [
                    g.details for g in output_report.failed_guards
                ]
                answer += (
                    "\n\n[Safety notice: "
                    + "; ".join(failed_out)
                    + "]"
                )

            done_data = {
                "id": research_id,
                "answer": answer,
                "citations": citations,
            }
            yield f"event: done\ndata: {json.dumps(done_data)}\n\n"

        except Exception as exc:
            logger.exception("Streaming research failed")
            yield (
                f"event: error\n"
                f"data: {json.dumps({'message': str(exc)})}\n\n"
            )

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
