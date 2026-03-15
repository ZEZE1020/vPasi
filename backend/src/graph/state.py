"""
Research agent state — defines the TypedDict used across all graph nodes.
"""

from typing_extensions import TypedDict


class ResearchState(TypedDict):
    """State passed through the research agent graph."""

    # The original user query
    user_query: str

    # Channel the query came from (web, ussd, voice, whatsapp, sms)
    channel: str

    # Generated search queries derived from the user query
    search_queries: list[str]

    # Raw search results from the web search connector
    search_results: list[dict]

    # Reflection notes from the reflection node
    reflection: str

    # Current iteration count for the reflect-search loop
    iteration: int

    # Maximum iterations allowed
    max_iterations: int

    # The final synthesized answer
    answer: str

    # Extracted citations from search results
    citations: list[dict]

    # Activity timeline entries for the frontend
    timeline: list[dict]

    # Error state
    error: str | None
