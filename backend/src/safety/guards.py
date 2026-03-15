"""
AI Safety guardrails — input validation and output filtering.

Each guard returns a GuardResult indicating whether the content passed
and any details about detected issues.
"""

import logging
import re
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class GuardResult:
    """Result from a safety guard check."""

    passed: bool
    guard_name: str
    details: str = ""
    redacted_text: str | None = None


@dataclass
class SafetyReport:
    """Aggregated results from all safety guards."""

    results: list[GuardResult] = field(default_factory=list)

    @property
    def passed(self) -> bool:
        return all(r.passed for r in self.results)

    @property
    def failed_guards(self) -> list[GuardResult]:
        return [r for r in self.results if not r.passed]


# ── Prompt Injection Detection ────────────────────────────────

# Patterns that suggest prompt injection attempts
INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"disregard\s+(all\s+)?(previous|above|prior)",
    r"you\s+are\s+now\s+a",
    r"new\s+instructions?\s*:",
    r"system\s*prompt\s*:",
    r"<\s*system\s*>",
    r"act\s+as\s+(if\s+you\s+are|a)",
    r"pretend\s+(you\s+are|to\s+be)",
    r"override\s+(your|the)\s+(instructions|rules|guidelines)",
]

_injection_re = re.compile("|".join(INJECTION_PATTERNS), re.IGNORECASE)


def check_prompt_injection(text: str) -> GuardResult:
    """Detect prompt injection attempts in user input."""
    match = _injection_re.search(text)
    if match:
        logger.warning("Prompt injection detected", extra={"pattern": match.group()})
        return GuardResult(
            passed=False,
            guard_name="prompt_injection",
            details=f"Detected prompt injection pattern: '{match.group()}'",
        )
    return GuardResult(passed=True, guard_name="prompt_injection")


# ── PII Detection ────────────────────────────────────────────

PII_PATTERNS = {
    "email": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
    "phone_international": r"\+\d{10,15}",
    "credit_card": r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b",
    "ssn": r"\b\d{3}-\d{2}-\d{4}\b",
}


def check_pii(text: str) -> GuardResult:
    """Detect personally identifiable information in text."""
    detected = []
    for pii_type, pattern in PII_PATTERNS.items():
        if re.search(pattern, text):
            detected.append(pii_type)

    if detected:
        logger.warning("PII detected", extra={"types": detected})
        return GuardResult(
            passed=False,
            guard_name="pii_detection",
            details=f"Detected PII types: {', '.join(detected)}",
        )
    return GuardResult(passed=True, guard_name="pii_detection")


def redact_pii(text: str) -> str:
    """Redact detected PII from text."""
    redacted = text
    for pii_type, pattern in PII_PATTERNS.items():
        redacted = re.sub(pattern, f"[REDACTED_{pii_type.upper()}]", redacted)
    return redacted


# ── Toxicity Filter ──────────────────────────────────────────

TOXIC_KEYWORDS = [
    "kill", "murder", "bomb", "attack", "weapon", "explosive",
    "trafficking", "smuggling", "illegal drugs", "counterfeit",
]


def check_toxicity(text: str) -> GuardResult:
    """Basic keyword-based toxicity check."""
    text_lower = text.lower()
    found = [kw for kw in TOXIC_KEYWORDS if kw in text_lower]

    if found:
        logger.warning("Toxic content detected", extra={"keywords": found})
        return GuardResult(
            passed=False,
            guard_name="toxicity",
            details=f"Detected toxic keywords: {', '.join(found)}",
        )
    return GuardResult(passed=True, guard_name="toxicity")


# ── Hallucination Check ──────────────────────────────────────


def check_hallucination(answer: str, citations: list[dict]) -> GuardResult:
    """
    Basic hallucination check — verify that an answer with factual claims
    has at least one supporting citation.
    """
    # If the answer makes claims but has no citations, flag it
    factual_indicators = [
        "according to", "research shows", "studies indicate",
        "data from", "statistics show", "reports indicate",
        "as of", "in 2024", "in 2025", "in 2026",
    ]

    has_factual_claims = any(ind in answer.lower() for ind in factual_indicators)

    if has_factual_claims and len(citations) == 0:
        logger.warning("Potential hallucination — factual claims without citations")
        return GuardResult(
            passed=False,
            guard_name="hallucination",
            details="Answer contains factual claims but no supporting citations",
        )
    return GuardResult(passed=True, guard_name="hallucination")


# ── Bias Detection ────────────────────────────────────────────

BIAS_PATTERNS = [
    r"\b(always|never)\b.*\b(country|nation|people|tribe|ethnic)\b",
    r"\b(superior|inferior)\b.*\b(group|race|gender|culture)\b",
]

_bias_re = re.compile("|".join(BIAS_PATTERNS), re.IGNORECASE)


def check_bias(text: str) -> GuardResult:
    """Detect potential bias in generated responses."""
    match = _bias_re.search(text)
    if match:
        logger.warning("Potential bias detected", extra={"pattern": match.group()})
        return GuardResult(
            passed=False,
            guard_name="bias_detection",
            details=f"Potential bias pattern: '{match.group()}'",
        )
    return GuardResult(passed=True, guard_name="bias_detection")


# ── Aggregate Runner ──────────────────────────────────────────


def run_input_guards(text: str) -> SafetyReport:
    """Run all input-side safety guards."""
    report = SafetyReport()
    report.results.append(check_prompt_injection(text))
    report.results.append(check_pii(text))
    report.results.append(check_toxicity(text))
    return report


def run_output_guards(answer: str, citations: list[dict]) -> SafetyReport:
    """Run all output-side safety guards."""
    report = SafetyReport()
    report.results.append(check_hallucination(answer, citations))
    report.results.append(check_bias(answer))
    report.results.append(check_toxicity(answer))
    return report
