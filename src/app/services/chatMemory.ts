import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";

const STORAGE_KEY = "vpasi_chat_history";
const MAX_TURNS = 6;

const _histories = new Map<string, InMemoryChatMessageHistory>();
const _hydrated = new Set<string>();

function _storageKey(sessionId: string) {
  return `${STORAGE_KEY}_${sessionId}`;
}

function _getOrCreate(sessionId: string): InMemoryChatMessageHistory {
  if (!_histories.has(sessionId)) {
    _histories.set(sessionId, new InMemoryChatMessageHistory());
  }
  return _histories.get(sessionId)!;
}

/** Rehydrate from localStorage on first use (async, called once per session). */
async function _ensureHydrated(sessionId: string): Promise<InMemoryChatMessageHistory> {
  const history = _getOrCreate(sessionId);
  if (_hydrated.has(sessionId)) return history;
  _hydrated.add(sessionId);

  try {
    const raw = localStorage.getItem(_storageKey(sessionId));
    if (raw) {
      const turns: Array<{ role: "human" | "ai"; content: string }> = JSON.parse(raw);
      const messages: BaseMessage[] = turns.map(({ role, content }) =>
        role === "human" ? new HumanMessage(content) : new AIMessage(content)
      );
      await history.addMessages(messages);
    }
  } catch {
    // Corrupt storage — start fresh
  }

  return history;
}

/** Add a user+assistant turn and persist to localStorage. */
export async function addTurn(
  sessionId: string,
  userMessage: string,
  assistantMessage: string
): Promise<void> {
  const history = await _ensureHydrated(sessionId);
  await history.addMessages([
    new HumanMessage(userMessage),
    new AIMessage(assistantMessage),
  ]);

  try {
    const all = (await history.getMessages()) as BaseMessage[];
    const trimmed = all.slice(-MAX_TURNS * 2);
    const serialized = trimmed.map((m) => ({
      role: m._getType() === "human" ? "human" : "ai",
      content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
    }));
    localStorage.setItem(_storageKey(sessionId), JSON.stringify(serialized));
  } catch {
    // localStorage quota — not critical
  }
}

/** Format history as a compact context string to prepend to the query. */
export async function formatHistoryContext(sessionId: string): Promise<string> {
  const history = await _ensureHydrated(sessionId);
  const messages = (await history.getMessages()) as BaseMessage[];
  if (messages.length === 0) return "";

  const lines = messages.slice(-MAX_TURNS * 2).map((m) => {
    const role = m._getType() === "human" ? "Trader" : "vPasi";
    const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
    return `${role}: ${content}`;
  });

  return `Previous conversation:\n${lines.join("\n")}\n\nCurrent question:`;
}

/** Clear history for a session (on new chat). */
export function clearHistory(sessionId: string): void {
  _histories.delete(sessionId);
  _hydrated.delete(sessionId);
  try {
    localStorage.removeItem(_storageKey(sessionId));
  } catch {
    // ignore
  }
}
