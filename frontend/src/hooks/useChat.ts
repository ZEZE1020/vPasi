import { useState, useCallback, useRef } from "react";
import { streamResearch } from "../services/streamingApi";
import type {
  ChatMessage,
  Citation,
  ThinkingStep,
  AssistantStatus,
} from "../types";

const NODE_LABELS: Record<string, string> = {
  generate_queries: "Generating search queries",
  web_search: "Searching the web",
  reflect: "Analyzing results",
  synthesize: "Writing answer",
};

const NODE_STATUS: Record<string, AssistantStatus> = {
  generate_queries: "thinking",
  web_search: "searching",
  reflect: "reflecting",
  synthesize: "synthesizing",
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (query: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    const assistantId = crypto.randomUUID();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      thinkingSteps: [],
      citations: [],
      isStreaming: true,
      status: "thinking",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await streamResearch(
        query,
        {
          onStep: (event) => {
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.id !== assistantId) return msg;
                const step: ThinkingStep = {
                  id: crypto.randomUUID(),
                  node: event.node,
                  label: NODE_LABELS[event.node] || event.node,
                  detail: event.detail,
                  timestamp: new Date().toISOString(),
                  status: "complete",
                  data: event.data,
                };
                const steps = [...(msg.thinkingSteps || [])].map((s) => ({
                  ...s,
                  status: "complete" as const,
                }));
                steps.push(step);
                return {
                  ...msg,
                  thinkingSteps: steps,
                  status: NODE_STATUS[event.node] || msg.status,
                  content:
                    event.node === "synthesize"
                      ? (event.data.answer as string) || ""
                      : msg.content,
                  citations:
                    event.node === "synthesize"
                      ? (event.data.citations as Citation[]) || []
                      : msg.citations,
                };
              }),
            );
          },
          onDone: (event) => {
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.id !== assistantId) return msg;
                return {
                  ...msg,
                  content: event.answer,
                  citations: event.citations,
                  isStreaming: false,
                  status: "complete",
                };
              }),
            );
            setIsStreaming(false);
          },
          onError: (error) => {
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.id !== assistantId) return msg;
                return {
                  ...msg,
                  content: "An error occurred during research.",
                  isStreaming: false,
                  status: "error",
                  error,
                };
              }),
            );
            setIsStreaming(false);
          },
        },
        controller.signal,
      );
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id !== assistantId) return msg;
            return {
              ...msg,
              content: "Connection failed. Please try again.",
              isStreaming: false,
              status: "error",
              error: (err as Error).message,
            };
          }),
        );
        setIsStreaming(false);
      }
    }
  }, []);

  const clearChat = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, sendMessage, clearChat };
}
