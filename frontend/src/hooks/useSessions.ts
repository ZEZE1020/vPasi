import { useState, useCallback, useEffect } from "react";
import type { ChatSession, ChatMessage } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

interface SessionSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface SessionDetail {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

function toSession(s: SessionSummary, messages: ChatMessage[] = []): ChatSession {
  return {
    id: s.id,
    title: s.title,
    createdAt: s.created_at,
    messages,
  };
}

const LAST_SESSION_KEY = "vpasi_last_session_id";

export function useSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(
    () => localStorage.getItem(LAST_SESSION_KEY)
  );
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);

  // Persist active session ID to localStorage whenever it changes
  const setActiveSessionId = useCallback((id: string | null) => {
    setActiveSessionIdState(id);
    if (id) localStorage.setItem(LAST_SESSION_KEY, id);
    else localStorage.removeItem(LAST_SESSION_KEY);
  }, []);

  // Load session list on mount, then validate the restored session ID
  useEffect(() => {
    apiFetch<SessionSummary[]>("/api/sessions")
      .then((list) => {
        setSessions(list.map((s) => toSession(s)));
        // If the restored session no longer exists, clear it
        const restored = localStorage.getItem(LAST_SESSION_KEY);
        if (restored && !list.find((s) => s.id === restored)) {
          setActiveSessionId(null);
        }
      })
      .catch(() => setSessions([]));
  }, [setActiveSessionId]);

  // Load messages when active session changes
  useEffect(() => {
    if (!activeSessionId) {
      setActiveMessages([]);
      return;
    }
    apiFetch<SessionDetail>(`/api/sessions/${activeSessionId}`)
      .then((detail) => {
        const msgs = detail.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setActiveMessages(msgs);
      })
      .catch(() => {
        // Session gone — clear it
        setActiveSessionId(null);
      });
  }, [activeSessionId, setActiveSessionId]);

  const createSession = useCallback(async (): Promise<string> => {
    const summary = await apiFetch<SessionSummary>("/api/sessions", { method: "POST" });
    const session = toSession(summary);
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
    setActiveMessages([]);
    return session.id;
  }, [setActiveSessionId]);

  const updateSessionTitle = useCallback((id: string, title: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title } : s))
    );
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    await apiFetch(`/api/sessions/${id}`, { method: "DELETE" }).catch(() => {});
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setActiveMessages([]);
    }
  }, [activeSessionId, setActiveSessionId]);

  return {
    sessions,
    activeSessionId,
    activeMessages,
    setActiveMessages,
    setActiveSessionId,
    createSession,
    updateSessionTitle,
    deleteSession,
  };
}
