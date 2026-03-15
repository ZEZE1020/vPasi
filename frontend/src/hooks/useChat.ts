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

interface UseChatOptions {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onTitled?: (id: string, title: string) => void;
}

export function useChat({ messages, setMessages, onTitled }: UseChatOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  // Track accumulated steps across onStep calls
  const stepsRef = useRef<ThinkingStep[]>([]);

  const sendMessage = useCallback(
    async (query: string, sessionId?: string | null) => {
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: query,
        timestamp: new Date(),
      };

      const assistantId = crypto.randomUUID();
      stepsRef.current = [];

      setMessages((prev) => [...prev, userMsg, {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        thinkingSteps: [],
        citations: [],
        isStreaming: true,
        status: "thinking" as AssistantStatus,
      }]);
      setIsStreaming(true);

      const updateMsg = (patch: Partial<ChatMessage>) =>
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, ...patch } : m))
        );

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        if (sessionId && onTitled) {
          onTitled(sessionId, query.slice(0, 60) + (query.length > 60 ? "…" : ""));
        }

        await streamResearch(
          query,
          {
            onStep: (event) => {
              const newStep: ThinkingStep = {
                id: crypto.randomUUID(),
                node: event.node,
                label: NODE_LABELS[event.node] || event.node,
                detail: event.detail,
                timestamp: new Date().toISOString(),
                status: "complete",
                data: event.data,
              };
              stepsRef.current = [...stepsRef.current, newStep];
              updateMsg({
                thinkingSteps: stepsRef.current,
                status: NODE_STATUS[event.node] || "thinking",
                ...(event.node === "synthesize" && {
                  content: (event.data.answer as string) || "",
                  citations: (event.data.citations as Citation[]) || [],
                }),
              });
            },
            onDone: (event) => {
              const tokenUsage = event.token_usage;
              const tokenStep: ThinkingStep | null = tokenUsage
                ? {
                    id: crypto.randomUUID(),
                    node: "token_usage",
                    label: "Token usage",
                    detail: `Total ${tokenUsage.total_tokens} (in ${tokenUsage.input_tokens}, out ${tokenUsage.output_tokens})`,
                    timestamp: new Date().toISOString(),
                    status: "complete",
                    data: tokenUsage,
                  }
                : null;
              const finalSteps = tokenStep
                ? [...stepsRef.current, tokenStep]
                : stepsRef.current;
              stepsRef.current = [];
              updateMsg({
                content: event.answer,
                citations: event.citations,
                tokenUsage,
                thinkingSteps: finalSteps,
                isStreaming: false,
                status: "complete",
              });
              setIsStreaming(false);
            },
            onError: (error) => {
              stepsRef.current = [];
              updateMsg({ content: "An error occurred during research.", isStreaming: false, status: "error", error });
              setIsStreaming(false);
            },
          },
          controller.signal,
          sessionId,
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          stepsRef.current = [];
          updateMsg({ content: "Connection failed. Please try again.", isStreaming: false, status: "error", error: (err as Error).message });
          setIsStreaming(false);
        }
      }
    },
    [setMessages, onTitled],
  );

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    stepsRef.current = [];
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, sendMessage, stopStreaming };
}
