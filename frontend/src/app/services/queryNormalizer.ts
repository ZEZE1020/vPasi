import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getFastLlm } from "./llm";

const SYSTEM = new SystemMessage(
  `You are a query normalizer for an East African cross-border trade assistant.
Your job:
1. Detect the language (Swahili, Kikuyu, Luganda, French, or broken English).
2. Translate to clear English if needed.
3. Fix typos and expand abbreviations (e.g. "KE" → "Kenya", "UG" → "Uganda").
4. Keep trade-specific terms intact (HS codes, border names, goods names).
5. Return ONLY the cleaned English query — no explanation, no prefix.

Examples:
  "bei ya sukari nairobi" → "What is the price of sugar in Nairobi?"
  "how much tax maize busia" → "What is the import tax on maize at Busia border?"
  "docs needed KE to UG electronics" → "What documents are needed to import electronics from Kenya to Uganda?"
  "EAC CET rate for textiles" → "What is the EAC Common External Tariff rate for textiles?"
`
);

/**
 * Normalizes a raw user query before sending to the research backend.
 * Falls back to the original query if the API key is missing or the call fails.
 */
export async function normalizeQuery(raw: string): Promise<{
  normalized: string;
  wasTranslated: boolean;
}> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return { normalized: raw, wasTranslated: false };

  try {
    const llm = getFastLlm();
    const response = await llm.invoke([SYSTEM, new HumanMessage(raw)]);
    const normalized = (response.content as string).trim();
    const wasTranslated = normalized.toLowerCase() !== raw.toLowerCase();
    return { normalized, wasTranslated };
  } catch {
    // Never block the user — silently fall back
    return { normalized: raw, wasTranslated: false };
  }
}
