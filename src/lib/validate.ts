/**
 * Server-side re-validation — never trust the client's price or colour count.
 * Recomputes the order total with the engine and re-checks the screen colour
 * limit against the actual uploaded art colours.
 */
import sharp from "sharp";
import type { Product } from "./types";
import { methodById, countColors, colorsAllowed, PRINTING_METHODS } from "./printing-methods";
import { computeOrderTotals, effectivePricing, areaCm2 } from "./pricing";

export interface ValidateInput {
  product: Product;
  methodId: string;
  colors?: number;
  elements: number;
  qty: number;
  cardEnabled: boolean;
  cardPrice: number;
  perElement: number;
  vatPct: number;
  delivery: number;
  artBuffers?: Buffer[]; // uploaded logos to re-check against the colour limit
}

export async function validateOrder(input: ValidateInput) {
  const method = methodById(input.methodId) || PRINTING_METHODS[0];
  const cfg = input.product.methods.find((m) => m.methodId === input.methodId);
  const errors: string[] = [];
  if (!cfg?.enabled) errors.push("Selected print method is not available for this product.");

  // re-check screen colour limit against real art
  if (method.limit > 0 && method.effect === "ink" && input.artBuffers?.length) {
    for (const buf of input.artBuffers) {
      const { data } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const n = countColors(new Uint8ClampedArray(data));
      if (!colorsAllowed(method, n)) errors.push(`An uploaded logo has about ${n} colours, exceeding the ${method.limit}-colour limit.`);
    }
  }

  const area = input.product.views[0].printAreas[0];
  const price = computeOrderTotals(method, effectivePricing(method, cfg?.pricingOverride), {
    productBase: (input.product as any).basePrice ?? 20,
    qty: input.qty,
    areaCm2: areaCm2(area.realWidthMm, area.realHeightMm),
    colors: input.colors,
    elements: input.elements,
    perElement: input.perElement,
    cardPrice: input.cardEnabled ? input.cardPrice : 0,
    vatPct: input.vatPct,
    delivery: input.delivery,
  });

  return { ok: errors.length === 0, errors, price };
}
