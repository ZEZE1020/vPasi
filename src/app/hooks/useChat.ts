import { useState, useCallback, useRef } from "react";
import { streamResearch } from "../services/streamingApi";
import { normalizeQuery } from "../services/queryNormalizer";
import { addTurn, formatHistoryContext, clearHistory } from "../services/chatMemory";
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
      // Feature 1: normalize query (translate, fix typos)
      const { normalized, wasTranslated } = await normalizeQuery(query);

      // Feature 3: prepend conversation history for context
      const historyPrefix = sessionId
        ? await formatHistoryContext(sessionId)
        : "";
      const contextualQuery = historyPrefix
        ? `${historyPrefix} ${normalized}`
        : normalized;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: query, // always show original to the user
        normalizedContent: wasTranslated ? normalized : undefined,
        timestamp: new Date(),
      };

      const assistantId = crypto.randomUUID();
      const connectingStep: ThinkingStep = {
        id: crypto.randomUUID(),
        node: "connecting",
        label: "Connecting stream",
        detail: "Starting real-time research updates...",
        timestamp: new Date().toISOString(),
        status: "active",
      };
      stepsRef.current = [connectingStep];

      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          thinkingSteps: stepsRef.current,
          citations: [],
          isStreaming: true,
          status: "thinking" as AssistantStatus,
        },
      ]);
      setIsStreaming(true);

      const updateMsg = (patch: Partial<ChatMessage>) =>
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)),
        );

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        if (sessionId && onTitled) {
          onTitled(
            sessionId,
            query.slice(0, 60) + (query.length > 60 ? "…" : ""),
          );
        }

        await streamResearch(
          contextualQuery,
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
              const hasOnlyPlaceholder =
                stepsRef.current.length === 1 &&
                stepsRef.current[0].node === "connecting";

              stepsRef.current = hasOnlyPlaceholder
                ? [newStep]
                : [...stepsRef.current, newStep];
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
              // Feature 3: save turn to memory
              if (sessionId) {
                addTurn(sessionId, normalized, event.answer).catch(() => {});
              }
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
              const completedSteps = stepsRef.current.filter(
                (step) => step.node !== "connecting",
              );
              const finalSteps = tokenStep
                ? [...completedSteps, tokenStep]
                : completedSteps;
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
              updateMsg({
                content: "An error occurred during research.",
                isStreaming: false,
                status: "error",
                error,
              });
              setIsStreaming(false);
            },
          },
          controller.signal,
          sessionId,
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          stepsRef.current = [];
          updateMsg({
            content: "Connection failed. Please try again.",
            isStreaming: false,
            status: "error",
            error: (err as Error).message,
          });
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

  const startNewChat = useCallback((sessionId: string | null) => {
    if (sessionId) clearHistory(sessionId);
    stopStreaming();
  }, [stopStreaming]);

  return { messages, isStreaming, sendMessage, stopStreaming, startNewChat };
}
