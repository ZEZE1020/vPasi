"""
LangGraph research agent — iterative web research with reflection.

This package contains the LangGraph StateGraph that orchestrates:
  1. Query generation from user input
  2. Web search via search API
  3. Reflection on search results (quality, relevance, gaps)
  4. Iteration (re-search if needed)
  5. Answer synthesis with citations
"""
