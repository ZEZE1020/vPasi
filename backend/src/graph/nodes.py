"""
Graph nodes — individual steps in the research agent pipeline.

Each function takes a ResearchState dict and returns a partial state update.
Uses Google Gemini via langchain-google-genai for LLM calls and
DuckDuckGo for free web search (no API key required).
"""

import asyncio
import json
import logging
from datetime import UTC, datetime

from ddgs import DDGS
from langchain_google_genai import ChatGoogleGenerativeAI

from src.core.config import settings

logger = logging.getLogger(__name__)


def _get_llm() -> ChatGoogleGenerativeAI:
    """Create a Gemini LLM instance using Google AI Studio API key."""
    return ChatGoogleGenerativeAI(
        model=settings.VERTEX_AI_MODEL,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.4,
        max_output_tokens=2048,
    )


def _extract_text(content: object) -> str:
    """Safely extract text from a Gemini response content field."""
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        for item in content:
            if isinstance(item, str):
                return item.strip()
            if isinstance(item, dict) and "text" in item:
                return str(item["text"]).strip()
        return str(content[0]).strip() if content else "[]"
    return str(content).strip()


async def generate_queries(state: dict) -> dict:
    """
    Generate search queries from the user's input.

    Uses Gemini to decompose the user query into 2-3 targeted search queries.
    """
    user_query = state["user_query"]
    logger.info("Generating search queries", extra={"user_query": user_query})

    try:
        llm = _get_llm()
        prompt = (
            "You are a research assistant. Given a user question, generate "
            "2-3 focused web search queries that would help answer it. "
            "Return ONLY a JSON array of strings, no other text.\n\n"
            f"User question: {user_query}"
        )
        response = await llm.ainvoke(prompt)
        content = _extract_text(response.content)
        # Extract JSON array from response
        start = content.find("[")
        end = content.rfind("]") + 1
        if start != -1 and end > start:
            search_queries = json.loads(content[start:end])
        else:
            search_queries = [user_query]
    except Exception:
        logger.exception("Failed to generate queries, using original")
        search_queries = [user_query]

    return {
        "search_queries": search_queries,
        "timeline": state.get("timeline", []) + [
            {
                "step": "generate_queries",
                "timestamp": datetime.now(UTC).isoformat(),
                "detail": f"Generated {len(search_queries)} search queries",
            }
        ],
    }


def _run_ddg_search(queries: list[str]) -> list[dict]:
    """Synchronous DuckDuckGo search — runs in a thread."""
    all_results: list[dict] = []
    ddgs = DDGS()
    for query in queries[:3]:
        results = ddgs.text(query, max_results=3)
        for r in results:
            all_results.append({
                "title": r.get("title", ""),
                "url": r.get("href", r.get("link", "")),
                "snippet": r.get("body", r.get("snippet", "")),
                "query": query,
            })
    return all_results


async def web_search(state: dict) -> dict:
    """
    Execute web searches using DuckDuckGo (free, no API key required).

    Runs the synchronous DDGS client in a thread to avoid blocking
    the async event loop.
    """
    search_queries = state["search_queries"]
    logger.info(
        "Executing web search",
        extra={"num_queries": len(search_queries)},
    )

    try:
        all_results = await asyncio.to_thread(
            _run_ddg_search, search_queries
        )
    except Exception:
        logger.exception("Web search failed")
        all_results = []

    # Deduplicate by URL
    seen_urls: set[str] = set()
    unique_results: list[dict] = []
    for r in all_results:
        if r["url"] and r["url"] not in seen_urls:
            seen_urls.add(r["url"])
            unique_results.append(r)

    return {
        "search_results": unique_results,
        "timeline": state.get("timeline", []) + [
            {
                "step": "web_search",
                "timestamp": datetime.now(UTC).isoformat(),
                "detail": (
                    f"Searched {len(search_queries)} queries, "
                    f"found {len(unique_results)} results"
                ),
            }
        ],
    }


async def reflect(state: dict) -> dict:
    """
    Reflect on search results quality and decide whether to iterate.
    """
    search_results = state["search_results"]
    user_query = state["user_query"]
    iteration = state.get("iteration", 0)
    logger.info(
        "Reflecting on results",
        extra={
            "iteration": iteration,
            "num_results": len(search_results),
        },
    )

    if not search_results:
        reflection = "No search results found. Cannot iterate further."
        return {
            "reflection": reflection,
            "iteration": iteration + 1,
            "timeline": state.get("timeline", []) + [
                {
                    "step": "reflect",
                    "timestamp": datetime.now(UTC).isoformat(),
                    "detail": f"Iteration {iteration + 1}: {reflection}",
                }
            ],
        }

    try:
        llm = _get_llm()
        snippets = "\n".join(
            f"- [{r['title']}]: {r['snippet']}"
            for r in search_results[:8]
        )
        prompt = (
            "You are evaluating search results for a research query.\n\n"
            f"Original question: {user_query}\n\n"
            f"Search results:\n{snippets}\n\n"
            "In 1-2 sentences, assess: do these results adequately "
            "answer the question? What gaps remain?"
        )
        response = await llm.ainvoke(prompt)
        reflection = _extract_text(response.content)
    except Exception:
        logger.exception("Reflection failed")
        reflection = "Reflection unavailable, proceeding to synthesis."

    return {
        "reflection": reflection,
        "iteration": iteration + 1,
        "timeline": state.get("timeline", []) + [
            {
                "step": "reflect",
                "timestamp": datetime.now(UTC).isoformat(),
                "detail": f"Iteration {iteration + 1}: {reflection}",
            }
        ],
    }


async def synthesize(state: dict) -> dict:
    """
    Synthesize a final answer with citations from search results.
    """
    user_query = state["user_query"]
    search_results = state["search_results"]
    logger.info(
        "Synthesizing answer",
        extra={
            "user_query": user_query,
            "num_results": len(search_results),
        },
    )

    # Build citations from search results
    citations = [
        {
            "title": r["title"],
            "url": r["url"],
            "snippet": r["snippet"],
        }
        for r in search_results
        if r.get("url")
    ]

    if not search_results:
        answer = (
            f"I was unable to find relevant search results for: "
            f"'{user_query}'. Please try rephrasing your question."
        )
        return {
            "answer": answer,
            "citations": [],
            "timeline": state.get("timeline", []) + [
                {
                    "step": "synthesize",
                    "timestamp": datetime.now(UTC).isoformat(),
                    "detail": "No results to synthesize",
                }
            ],
        }

    try:
        llm = _get_llm()
        sources = "\n".join(
            f"[{i + 1}] {r['title']} — {r['snippet']}"
            for i, r in enumerate(search_results[:8])
        )
        prompt = (
            "You are a research assistant. Synthesize a clear, "
            "comprehensive answer to the user's question based on "
            "the search results below. Include citation numbers "
            "[1], [2], etc. to reference your sources.\n\n"
            f"Question: {user_query}\n\n"
            f"Sources:\n{sources}\n\n"
            "Provide a well-structured answer with citations."
        )
        response = await llm.ainvoke(prompt)
        answer = _extract_text(response.content)
    except Exception:
        logger.exception("Synthesis failed")
        answer = (
            f"Research results for: {user_query}\n\n"
            "I found some sources but had trouble synthesizing "
            "an answer. Please review the citations below."
        )

    return {
        "answer": answer,
        "citations": citations,
        "timeline": state.get("timeline", []) + [
            {
                "step": "synthesize",
                "timestamp": datetime.now(UTC).isoformat(),
                "detail": (
                    f"Synthesized answer with "
                    f"{len(citations)} citations"
                ),
            }
        ],
    }
