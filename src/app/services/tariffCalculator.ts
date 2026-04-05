import { z } from "zod";
import { getLlm } from "./llm";

export const TariffResultSchema = z.object({
  hs_code: z.string().describe("EAC HS code for the goods category"),
  tariff_rate: z.number().describe("Import tariff rate as a percentage (e.g. 25 for 25%)"),
  tariff_amount: z.number().describe("Tariff amount in USD"),
  vat_rate: z.number().describe("VAT rate as a percentage"),
  vat_amount: z.number().describe("VAT amount in USD"),
  processing_fee: z.number().describe("Border processing/clearance fee in USD"),
  total_cost: z.number().describe("Total border cost in USD (tariff + VAT + processing fee)"),
  estimated_profit: z.number().describe("Estimated profit at 25% markup in USD"),
  net_profit: z.number().describe("Net profit after all border costs in USD"),
  required_documents: z.array(z.string()).describe("List of documents required at this border"),
  notes: z.string().describe("Any important notes, exemptions, or warnings for this trade route"),
});

export type TariffResult = z.infer<typeof TariffResultSchema>;

export interface TariffInput {
  goodsCategory: string;
  goodsValue: string;
  originCountry: string;
  destinationCountry: string;
  borderCrossing: string;
}

/**
 * Calls Gemini with structured output to calculate real EAC tariffs.
 * Returns null if the API key is missing, falling back to the mock calculation.
 */
export async function calculateTariffWithAI(
  input: TariffInput
): Promise<TariffResult | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const llm = getLlm();
    const structured = llm.withStructuredOutput(TariffResultSchema);

    const prompt = `You are an EAC trade compliance expert. Calculate the exact import tariff and costs for:

Goods: ${input.goodsCategory}
Declared Value: $${input.goodsValue} USD
Origin: ${input.originCountry}
Destination: ${input.destinationCountry}
Border Crossing: ${input.borderCrossing}

Use the EAC Common External Tariff (CET) rates. Apply the correct HS code for the goods category.
Include VAT at the destination country's standard rate.
List all required documents for this specific border crossing.
Provide realistic processing fees for ${input.borderCrossing}.
Add any relevant notes about exemptions, restrictions, or special procedures.`;

    const result = await structured.invoke(prompt);
    return result;
  } catch {
    return null;
  }
}

/** Fallback mock calculation used when API key is absent or call fails. */
export function mockCalculateTariff(input: TariffInput): TariffResult {
  const base = parseFloat(input.goodsValue) || 0;
  const tariffRate = 12;
  const vatRate = 16;
  const tariffAmount = base * (tariffRate / 100);
  const vatAmount = base * (vatRate / 100);
  const processingFee = 50;
  const totalCost = tariffAmount + vatAmount + processingFee;
  const estimatedProfit = base * 0.25;
  return {
    hs_code: "—",
    tariff_rate: tariffRate,
    tariff_amount: tariffAmount,
    vat_rate: vatRate,
    vat_amount: vatAmount,
    processing_fee: processingFee,
    total_cost: totalCost,
    estimated_profit: estimatedProfit,
    net_profit: estimatedProfit - totalCost,
    required_documents: ["Commercial Invoice", "Packing List", "Certificate of Origin"],
    notes: "Estimated rates — configure VITE_GEMINI_API_KEY for real EAC tariff data.",
  };
}
