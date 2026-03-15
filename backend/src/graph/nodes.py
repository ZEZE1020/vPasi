"""
Graph nodes — individual steps in the research agent pipeline.

Each function takes a ResearchState dict and returns a partial state update.
Uses Google Gemini via API key for LLM calls and
DuckDuckGo for free web search (no API key required).
"""

import asyncio
import json
import logging
from datetime import UTC, datetime
from functools import lru_cache
from typing import Any

from ddgs import DDGS
from langchain_google_genai import ChatGoogleGenerativeAI

from src.core.config import settings

logger = logging.getLogger(__name__)

# Limit concurrent Gemini calls to avoid quota exhaustion
_llm_semaphore = asyncio.Semaphore(5)


def _empty_token_usage() -> dict[str, int]:
    """Token usage payload with stable keys for aggregation and UI display."""
    return {
        "input_tokens": 0,
        "output_tokens": 0,
        "total_tokens": 0,
    }


def _normalize_token_usage(raw_usage: object) -> dict[str, int]:
    """Normalize provider-specific token metadata into a common schema."""
    usage = _empty_token_usage()
    if not isinstance(raw_usage, dict):
        return usage

    input_tokens = (
        raw_usage.get("input_tokens")
        or raw_usage.get("prompt_tokens")
        or raw_usage.get("prompt_token_count")
        or 0
    )
    output_tokens = (
        raw_usage.get("output_tokens")
        or raw_usage.get("completion_tokens")
        or raw_usage.get("candidates_token_count")
        or 0
    )
    total_tokens = (
        raw_usage.get("total_tokens")
        or raw_usage.get("total_token_count")
        or 0
    )

    usage["input_tokens"] = int(input_tokens)
    usage["output_tokens"] = int(output_tokens)
    usage["total_tokens"] = int(total_tokens) if int(total_tokens) > 0 else int(input_tokens) + int(output_tokens)
    return usage


def _merge_token_usage(base_usage: object, delta_usage: object) -> dict[str, int]:
    """Accumulate token usage across graph steps."""
    base = _normalize_token_usage(base_usage)
    delta = _normalize_token_usage(delta_usage)
    return {
        "input_tokens": base["input_tokens"] + delta["input_tokens"],
        "output_tokens": base["output_tokens"] + delta["output_tokens"],
        "total_tokens": base["total_tokens"] + delta["total_tokens"],
    }


def _usage_summary(usage: object) -> str:
    """Human-readable token summary for timeline details."""
    normalized = _normalize_token_usage(usage)
    return (
        "tokens="
        f"{normalized['total_tokens']} "
        f"(in={normalized['input_tokens']}, out={normalized['output_tokens']})"
    )


def _current_total_tokens(state: dict) -> int:
    """Read cumulative token usage from state."""
    usage = state.get("token_usage", {})
    if not isinstance(usage, dict):
        return 0
    return int(usage.get("total_tokens", 0) or 0)


def _budget_remaining(state: dict) -> int:
    """Return remaining token budget for this request."""
    return settings.RESEARCH_TOKEN_BUDGET - _current_total_tokens(state)


def _budget_exhausted(state: dict) -> bool:
    """True when strict token budget has been reached."""
    return _budget_remaining(state) <= 0


def _budget_notice() -> str:
    """Consistent detail string for timeline when budget gate is active."""
    return f"Token budget reached ({settings.RESEARCH_TOKEN_BUDGET}); skipped LLM call"


def _extractive_fallback_answer(user_query: str, search_results: list[dict]) -> str:
    """Produce a no-LLM fallback answer when budget prevents synthesis."""
    if not search_results:
        return (
            "I found no reliable sources for this query within the current "
            "token budget. Please rephrase or try a narrower question."
        )

    top = search_results[:3]
    lines = [
        "Token budget reached before synthesis. Here are top findings:",
    ]
    for idx, result in enumerate(top, start=1):
        title = result.get("title", "Untitled source")
        snippet = str(result.get("snippet", "")).strip()
        if len(snippet) > 220:
            snippet = snippet[:217] + "..."
        lines.append(f"{idx}. {title}: {snippet}")

    lines.append(f"Query: {user_query}")
    lines.append("Tip: ask a narrower follow-up for a full synthesized answer.")
    return "\n".join(lines)

SYSTEM_INSTRUCTION = """You are vPasi, an AI research assistant specializing in East African trade, \
customs, and regulatory information. Your primary focus is helping users understand:

- Import/export duties and tariffs across EAC member states (Kenya, Tanzania, Uganda, Rwanda, Burundi, South Sudan, DRC)
- Customs procedures and documentation requirements
- Trade regulations and compliance
- EAC Common External Tariff (CET) classifications
- Rules of origin and preferential trade agreements

Guidelines:
- Provide accurate, up-to-date information with citations
- When uncertain, clearly state limitations and suggest official sources
- Use clear, professional language accessible to traders and businesses
- Include specific HS codes, duty rates, and relevant regulations when applicable
- Highlight any recent policy changes or important deadlines"""


@lru_cache(maxsize=1)
def _get_llm() -> ChatGoogleGenerativeAI:
    """Cached Gemini instance using API key."""
    return ChatGoogleGenerativeAI(
        model=settings.VERTEX_AI_MODEL,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.4,
        max_output_tokens=2048,
    )


@lru_cache(maxsize=1)
def _get_query_llm() -> ChatGoogleGenerativeAI:
    """Lighter Gemini instance for short structured outputs."""
    return ChatGoogleGenerativeAI(
        model=settings.VERTEX_AI_MODEL,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.2,
        max_output_tokens=512,
    )


async def _invoke_llm(prompt: str, timeout: float = 30.0) -> tuple[str, dict[str, int]]:
    """Invoke the LLM with concurrency control and a timeout."""
    async with _llm_semaphore:
        llm = _get_llm()
        response = await asyncio.wait_for(llm.ainvoke(prompt), timeout=timeout)
        text = _extract_text(getattr(response, "content", ""))
        usage = _extract_usage(response)
        return text, usage


async def _invoke_query_llm(prompt: str, timeout: float = 15.0) -> tuple[str, dict[str, int]]:
    """Invoke the lighter query LLM with concurrency control."""
    async with _llm_semaphore:
        llm = _get_query_llm()
        response = await asyncio.wait_for(llm.ainvoke(prompt), timeout=timeout)
        text = _extract_text(getattr(response, "content", ""))
        usage = _extract_usage(response)
        return text, usage


def _extract_usage(response: Any) -> dict[str, int]:
    """Extract token usage from AIMessage metadata when available."""
    usage_metadata = getattr(response, "usage_metadata", None)
    if usage_metadata:
        return _normalize_token_usage(usage_metadata)

    response_metadata = getattr(response, "response_metadata", None)
    if isinstance(response_metadata, dict):
        nested_usage = (
            response_metadata.get("usage_metadata")
            or response_metadata.get("token_usage")
            or response_metadata.get("usage")
        )
        return _normalize_token_usage(nested_usage)

    return _empty_token_usage()


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

    if _budget_exhausted(state):
        return {
            "search_queries": [user_query],
            "token_usage": state.get("token_usage", _empty_token_usage()),
            "timeline": state.get("timeline", []) + [
                {
                    "step": "generate_queries",
                    "timestamp": datetime.now(UTC).isoformat(),
                    "detail": f"{_budget_notice()}; using original query",
                }
            ],
        }

    try:
        prompt = (
            "You are a research assistant. Given a user question, generate "
            "2-3 focused web search queries that would help answer it. "
            "Return ONLY a JSON array of strings, no other text.\n\n"
            f"User question: {user_query}"
        )
        content, usage = await _invoke_query_llm(prompt)
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
        usage = _empty_token_usage()

    total_usage = _merge_token_usage(state.get("token_usage", _empty_token_usage()), usage)

    return {
        "search_queries": search_queries,
        "token_usage": total_usage,
        "timeline": state.get("timeline", []) + [
            {
                "step": "generate_queries",
                "timestamp": datetime.now(UTC).isoformat(),
                "detail": (
                    f"Generated {len(search_queries)} search queries "
                    f"({_usage_summary(usage)})"
                ),
            }
        ],
    }


def _search_single(query: str) -> list[dict]:
    """Run a single DuckDuckGo search query synchronously."""
    try:
        ddgs = DDGS()
        results = ddgs.text(query, max_results=3)
        return [
            {
                "title": r.get("title", ""),
                "url": r.get("href", r.get("link", "")),
                "snippet": r.get("body", r.get("snippet", "")),
                "query": query,
            }
            for r in results
        ]
    except Exception:
        logger.exception("Search failed for query: %s", query)
        return []


async def web_search(state: dict) -> dict:
    """
    Execute web searches using DuckDuckGo (free, no API key required).

    Runs searches concurrently in separate threads for faster results.
    """
    search_queries = state["search_queries"]
    logger.info(
        "Executing web search",
        extra={"num_queries": len(search_queries)},
    )

    # Run all searches concurrently with a 15s timeout
    tasks = [asyncio.to_thread(_search_single, q) for q in search_queries[:3]]
    try:
        results = await asyncio.wait_for(
            asyncio.gather(*tasks, return_exceptions=True),
            timeout=15.0,
        )
    except asyncio.TimeoutError:
        logger.warning("Web search timed out")
        results = []

    # Flatten results, skip exceptions
    all_results: list[dict] = []
    for r in results:
        if isinstance(r, list):
            all_results.extend(r)

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
            "token_usage": state.get("token_usage", _empty_token_usage()),
            "timeline": state.get("timeline", []) + [
                {
                    "step": "reflect",
                    "timestamp": datetime.now(UTC).isoformat(),
                    "detail": f"Iteration {iteration + 1}: {reflection}",
                }
            ],
        }

    if _budget_exhausted(state):
        reflection = "Skipped reflection because request reached token budget."
        return {
            "reflection": reflection,
            "iteration": iteration + 1,
            "token_usage": state.get("token_usage", _empty_token_usage()),
            "timeline": state.get("timeline", []) + [
                {
                    "step": "reflect",
                    "timestamp": datetime.now(UTC).isoformat(),
                    "detail": f"Iteration {iteration + 1}: {reflection}",
                }
            ],
        }

    try:
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
        reflection, usage = await _invoke_llm(prompt)
    except Exception:
        logger.exception("Reflection failed")
        reflection = "Reflection unavailable, proceeding to synthesis."
        usage = _empty_token_usage()

    total_usage = _merge_token_usage(state.get("token_usage", _empty_token_usage()), usage)

    return {
        "reflection": reflection,
        "iteration": iteration + 1,
        "token_usage": total_usage,
        "timeline": state.get("timeline", []) + [
            {
                "step": "reflect",
                "timestamp": datetime.now(UTC).isoformat(),
                "detail": (
                    f"Iteration {iteration + 1}: {reflection} "
                    f"({_usage_summary(usage)})"
                ),
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
            "token_usage": state.get("token_usage", _empty_token_usage()),
            "timeline": state.get("timeline", []) + [
                {
                    "step": "synthesize",
                    "timestamp": datetime.now(UTC).isoformat(),
                    "detail": "No results to synthesize",
                }
            ],
        }

    if _budget_exhausted(state):
        answer = _extractive_fallback_answer(user_query, search_results)
        return {
            "answer": answer,
            "citations": citations,
            "token_usage": state.get("token_usage", _empty_token_usage()),
            "timeline": state.get("timeline", []) + [
                {
                    "step": "synthesize",
                    "timestamp": datetime.now(UTC).isoformat(),
                    "detail": f"{_budget_notice()}; returned extractive fallback",
                }
            ],
        }

    try:
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
        answer, usage = await _invoke_llm(prompt, timeout=45.0)
    except Exception:
        logger.exception("Synthesis failed")
        answer = (
            f"Research results for: {user_query}\n\n"
            "I found some sources but had trouble synthesizing "
            "an answer. Please review the citations below."
        )
        usage = _empty_token_usage()

    total_usage = _merge_token_usage(state.get("token_usage", _empty_token_usage()), usage)

    logger.info(
        "Research synthesis token usage",
        extra={
            "input_tokens": total_usage["input_tokens"],
            "output_tokens": total_usage["output_tokens"],
            "total_tokens": total_usage["total_tokens"],
        },
    )

    return {
        "answer": answer,
        "citations": citations,
        "token_usage": total_usage,
        "timeline": state.get("timeline", []) + [
            {
                "step": "synthesize",
                "timestamp": datetime.now(UTC).isoformat(),
                "detail": (
                    f"Synthesized answer with "
                    f"{len(citations)} citations "
                    f"({_usage_summary(usage)}; cumulative={_usage_summary(total_usage)})"
                ),
            }
        ],
    }
