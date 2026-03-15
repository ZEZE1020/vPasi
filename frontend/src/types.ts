export interface TimelineEntry {
  step: string;
  timestamp: string;
  detail: string;
}

export interface Citation {
  title: string;
  url: string;
  snippet: string;
}

export interface ResearchResult {
  id: string;
  query: string;
  answer: string;
  citations: Citation[];
  timeline: TimelineEntry[];
}

// ── Session Types ───────────────────────────────────────────

export interface ChatSession {
  id: string;
  title: string; // first user message, truncated
  createdAt: string; // ISO string for localStorage serialisation
  messages: ChatMessage[];
}

// ── Chat Message Types ──────────────────────────────────────

export type MessageRole = "user" | "assistant";

export type AssistantStatus =
  | "thinking"
  | "searching"
  | "reflecting"
  | "synthesizing"
  | "complete"
  | "error";

export interface ThinkingStep {
  id: string;
  node: string;
  label: string;
  detail: string;
  timestamp: string;
  status: "active" | "complete";
  data?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  thinkingSteps?: ThinkingStep[];
  citations?: Citation[];
  tokenUsage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  isStreaming?: boolean;
  status?: AssistantStatus;
  error?: string;
}

// ── SSE Event Types ─────────────────────────────────────────

export interface SSEStepEvent {
  node: string;
  detail: string;
  data: Record<string, unknown>;
}

export interface SSEDoneEvent {
  id: string;
  answer: string;
  citations: Citation[];
  token_usage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}
