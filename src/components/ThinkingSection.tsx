import { useState, useEffect } from "react";
import type { ThinkingStep, AssistantStatus } from "../types";

const STATUS_LABELS: Record<string, string> = {
  thinking: "Generating search queries...",
  searching: "Searching the web...",
  reflecting: "Analyzing results...",
  synthesizing: "Writing answer...",
};

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="11 4 5.5 9.5 3 7" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="thinking-icon-animated"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M7 1a6 6 0 0 1 6 6" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: direction === "up" ? "rotate(180deg)" : "none",
        transition: "transform 0.2s",
      }}
    >
      <polyline points="2 4 6 8 10 4" />
    </svg>
  );
}

function ThinkingIcon({ isAnimating }: { isAnimating: boolean }) {
  return (
    <svg
      className={isAnimating ? "thinking-icon-animated" : ""}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="7" cy="7" r="6" />
      <path d="M5 5.5a2 2 0 0 1 4 0c0 1-1.5 1.25-1.5 2.5" />
      <circle cx="7" cy="10.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function ThinkingSection({
  steps,
  isStreaming,
  status,
}: {
  steps: ThinkingStep[];
  isStreaming: boolean;
  status: AssistantStatus;
}) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!isStreaming && status === "complete") {
      const timer = setTimeout(() => setIsOpen(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isStreaming, status]);

  const statusLabel = isStreaming
    ? STATUS_LABELS[status] || "Thinking..."
    : `Researched in ${steps.length} steps`;

  return (
    <div className="thinking-section">
      <button className="thinking-toggle" onClick={() => setIsOpen(!isOpen)}>
        <ThinkingIcon isAnimating={isStreaming} />
        <span className="thinking-label">{statusLabel}</span>
        <ChevronIcon direction={isOpen ? "up" : "down"} />
      </button>

      {isOpen && (
        <div className="thinking-steps">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`thinking-step thinking-step-${step.status}`}
            >
              <div className="step-indicator">
                {step.status === "active" ? <SpinnerIcon /> : <CheckIcon />}
              </div>
              <div className="step-content">
                <span className="step-label">{step.label}</span>
                <span className="step-detail">{step.detail}</span>
              </div>
            </div>
          ))}
          {isStreaming && (
            <div className="thinking-step thinking-step-active">
              <div className="step-indicator">
                <SpinnerIcon />
              </div>
              <div className="step-content">
                <span className="step-label">
                  {STATUS_LABELS[status] || "Processing..."}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ThinkingSection;
