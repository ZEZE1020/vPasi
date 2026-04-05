import { z } from "zod";
import { getLlm } from "./llm";

export type OutputChannel = "web" | "whatsapp" | "ussd" | "sms";

const UssdSchema = z.object({
  message: z.string().max(182).describe("Plain text response, max 182 characters, no markdown"),
  has_more: z.boolean().describe("True if the full answer was truncated"),
  page: z.number().describe("Current page number, starting at 1"),
});

const WhatsAppSchema = z.object({
  message: z.string().max(1600).describe("WhatsApp-formatted response using *bold* and line breaks, max 1600 chars"),
  has_more: z.boolean().describe("True if the full answer was truncated"),
});

export type UssdOutput = z.infer<typeof UssdSchema>;
export type WhatsAppOutput = z.infer<typeof WhatsAppSchema>;

/**
 * Formats a full markdown answer for a specific output channel.
 * Falls back to simple string truncation if the API key is missing.
 */
export async function formatForChannel(
  answer: string,
  channel: OutputChannel,
  page = 1
): Promise<string> {
  if (channel === "web") return answer;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return simpleTruncate(answer, channel);

  try {
    const llm = getLlm();

    if (channel === "ussd" || channel === "sms") {
      const structured = llm.withStructuredOutput(UssdSchema);
      const result = await structured.invoke(
        `Reformat this trade answer for USSD display (page ${page}).
Rules: plain text only, no markdown, no bullet symbols, max 182 characters total.
If truncated, end with "Reply 1 for more".

Answer: ${answer}`
      );
      return result.has_more
        ? `${result.message}\nReply 1 for more`
        : result.message;
    }

    if (channel === "whatsapp") {
      const structured = llm.withStructuredOutput(WhatsAppSchema);
      const result = await structured.invoke(
        `Reformat this trade answer for WhatsApp.
Rules: use *bold* for key numbers and terms, keep line breaks, max 1600 characters.
Remove HTML and complex markdown. Keep citations as plain URLs.

Answer: ${answer}`
      );
      return result.message;
    }
  } catch {
    return simpleTruncate(answer, channel);
  }

  return answer;
}

function simpleTruncate(text: string, channel: OutputChannel): string {
  // Strip markdown
  const plain = text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .trim();

  const limit = channel === "ussd" || channel === "sms" ? 160 : 1600;
  if (plain.length <= limit) return plain;
  return plain.slice(0, limit - 3) + "...";
}
