"""
Research graph — compiles the LangGraph StateGraph for the research agent.

Graph topology:
    generate_queries → web_search → reflect → [should_continue?]
                                                 ├─ yes → web_search (loop)
                                                 └─ no  → synthesize → END
"""

import logging

from langgraph.graph import END, StateGraph

from src.graph.nodes import generate_queries, reflect, synthesize, web_search
from src.graph.state import ResearchState

logger = logging.getLogger(__name__)

DEFAULT_MAX_ITERATIONS = 3


def should_continue(state: dict) -> str:
    """Decide whether to continue the research loop or synthesize."""
    iteration = state.get("iteration", 0)
    max_iterations = state.get("max_iterations", DEFAULT_MAX_ITERATIONS)

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
    graph.add_edge("web_search", "reflect")
    graph.add_conditional_edges("reflect", should_continue, {
        "web_search": "web_search",
        "synthesize": "synthesize",
    })
    graph.add_edge("synthesize", END)

    return graph


# Compiled graph singleton
research_graph = build_research_graph().compile()
