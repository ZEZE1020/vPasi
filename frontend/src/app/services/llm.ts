import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

let _llm: ChatGoogleGenerativeAI | null = null;
let _fastLlm: ChatGoogleGenerativeAI | null = null;

function getApiKey(): string {
  return import.meta.env.VITE_GEMINI_API_KEY ?? "";
}

/** Full model — used for tariff calculations and USSD formatting. */
export function getLlm(): ChatGoogleGenerativeAI {
  if (!_llm) {
    _llm = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      apiKey: getApiKey(),
      temperature: 0.2,
      maxOutputTokens: 1024,
    });
  }
  return _llm;
}

/** Lightweight model — used for fast query normalization. */
export function getFastLlm(): ChatGoogleGenerativeAI {
  if (!_fastLlm) {
    _fastLlm = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash-8b",
      apiKey: getApiKey(),
      temperature: 0.1,
      maxOutputTokens: 256,
    });
  }
  return _fastLlm;
}
