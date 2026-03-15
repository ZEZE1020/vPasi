import type { SSEStepEvent, SSEDoneEvent } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "";

interface StreamCallbacks {
  onStep: (event: SSEStepEvent) => void;
  onDone: (event: SSEDoneEvent) => void;
  onError: (error: string) => void;
}

export async function streamResearch(
  query: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${API_URL}/api/research/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal,
  });

  if (!response.ok) {
    callbacks.onError(`Request failed: ${response.statusText}`);
    return;
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    let currentEvent = "";
    for (const line of lines) {
      if (line.startsWith("event: ")) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        const data = JSON.parse(line.slice(6));
        switch (currentEvent) {
          case "step":
            callbacks.onStep(data as SSEStepEvent);
            break;
          case "done":
            callbacks.onDone(data as SSEDoneEvent);
            break;
          case "error":
            callbacks.onError(data.message);
            break;
        }
        currentEvent = "";
      }
    }
  }
}
