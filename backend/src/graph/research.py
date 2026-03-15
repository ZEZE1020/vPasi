"""
Research graph — compiles the LangGraph StateGraph for the research agent.

Graph topology:
    generate_queries → web_search → reflect → [should_continue?]
                                                 ├─ yes → web_search (loop)
                                                 └─ no  → synthesize → END
"""

import logging

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph

from src.core.config import settings
from src.graph.nodes import generate_queries, reflect, synthesize, web_search
from src.graph.state import ResearchState

logger = logging.getLogger(__name__)

DEFAULT_MAX_ITERATIONS = 2


def _get_total_tokens(state: dict) -> int:
    """Return current cumulative token usage for this request."""
    usage = state.get("token_usage", {})
    if not isinstance(usage, dict):
        return 0
    return int(usage.get("total_tokens", 0) or 0)


def _is_simple_query(state: dict) -> bool:
    """Heuristic: short queries can skip reflection when search results are good."""
    query = str(state.get("user_query", "")).strip()
    if not query:
        return False
    words = [w for w in query.split() if w]
    return len(words) <= settings.RESEARCH_SKIP_REFLECTION_MAX_QUERY_WORDS


def should_reflect_after_search(state: dict) -> str:
    """Choose between reflection and direct synthesis after search."""
    total_tokens = _get_total_tokens(state)
    if total_tokens >= settings.RESEARCH_TOKEN_BUDGET:
        logger.info(
            "Token budget exhausted after search, skipping reflection",
            extra={
                "total_tokens": total_tokens,
                "token_budget": settings.RESEARCH_TOKEN_BUDGET,
            },
        )
        return "synthesize"

    result_count = len(state.get("search_results", []))
    if _is_simple_query(state) and result_count >= settings.RESEARCH_SKIP_REFLECTION_MIN_RESULTS:
        logger.info(
            "Simple query with sufficient results, skipping reflection",
            extra={"result_count": result_count},
        )
        return "synthesize"

    return "reflect"


def should_continue(state: dict) -> str:
    """Decide whether to continue the research loop or synthesize."""
    iteration = state.get("iteration", 0)
    max_iterations = state.get("max_iterations", DEFAULT_MAX_ITERATIONS)
    total_tokens = _get_total_tokens(state)

    if total_tokens >= settings.RESEARCH_TOKEN_BUDGET:
        logger.info(
            "Token budget reached, moving to synthesis",
            extra={
                "iteration": iteration,
                "total_tokens": total_tokens,
                "token_budget": settings.RESEARCH_TOKEN_BUDGET,
            },
        )
        return "synthesize"

    if iteration >= max_iterations:
        logger.info(
            "Max iterations reached, moving to synthesis",
            extra={"iteration": iteration},
        )
        return "synthesize"

    # If we have no results, no point re-searching
    if not state.get("search_results"):
        return "synthesize"

    # Check if reflection suggests we need more searching
    reflection = state.get("reflection", "")
    needs_more = any(
        kw in reflection.lower()
        for kw in ["gap", "missing", "insufficient", "incomplete", "more"]
    )

    if needs_more and iteration < max_iterations:
        logger.info(
            "Reflection suggests more research needed",
            extra={"iteration": iteration},
        )
        return "web_search"

    return "synthesize"


def build_research_graph() -> StateGraph:
    """Build and compile the research agent graph."""
    graph = StateGraph(ResearchState)

    # Add nodes
    graph.add_node("generate_queries", generate_queries)
    graph.add_node("web_search", web_search)
    graph.add_node("reflect", reflect)
    graph.add_node("synthesize", synthesize)

    # Define edges
    graph.set_entry_point("generate_queries")
    graph.add_edge("generate_queries", "web_search")
    graph.add_conditional_edges("web_search", should_reflect_after_search, {
        "reflect": "reflect",
        "synthesize": "synthesize",
    })
    graph.add_conditional_edges("reflect", should_continue, {
        "web_search": "web_search",
        "synthesize": "synthesize",
    })
    graph.add_edge("synthesize", END)

    return graph


# Compiled graph singleton with in-memory checkpointer for fault tolerance
research_graph = build_research_graph().compile(checkpointer=MemorySaver())
