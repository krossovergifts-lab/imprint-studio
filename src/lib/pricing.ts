/**
 * Pricing engine — one function the editor, admin preview, and cart all call.
 *
 * Price = setup (once) + unit × qty, where the unit is built from the method's
 * pricing model plus per-product overrides:
 *   - spot methods add perColor × number of colors
 *   - area methods add perCm2 × print-area area (cm²)
 * Keep this pure and deterministic so the live price in the editor always matches
 * the price written to the order.
 */

import type { PrintingMethod, PricingModel, ProductMethodConfig, PriceBreakdown } from "./types";

export const DEFAULT_CURRENCY = "AED";

/** Print area in cm² from real mm dimensions. */
export const areaCm2 = (realWidthMm: number, realHeightMm: number) => (realWidthMm / 10) * (realHeightMm / 10);

/** Resolve a method's effective pricing after a product override. */
export function effectivePricing(method: PrintingMethod, override?: Partial<PricingModel>): PricingModel {
  return { ...method.pricing, ...(override || {}) };
}

export interface PriceInput {
  colors?: number;    // spot methods
  areaCm2: number;
  qty?: number;
  currency?: string;
}

export function computePrice(method: PrintingMethod, pricing: PricingModel, input: PriceInput): PriceBreakdown {
  const qty = input.qty ?? 1;
  let unit = pricing.perUnit ?? 0;
  if (method.colorModel === "spot") unit += (pricing.perColor ?? 0) * (input.colors ?? 1);
  if (pricing.perCm2) unit += pricing.perCm2 * input.areaCm2;
  if (pricing.minCharge) unit = Math.max(unit, pricing.minCharge);
  const round = (n: number) => Math.round(n * 100) / 100;
  const setup = pricing.setup ?? 0;
  return { currency: input.currency ?? DEFAULT_CURRENCY, setup: round(setup), unit: round(unit), total: round(setup + unit * qty) };
}

/** Convenience: price straight from a product's method config. */
export function priceForProductMethod(
  method: PrintingMethod,
  cfg: ProductMethodConfig | undefined,
  input: PriceInput
): PriceBreakdown {
  return computePrice(method, effectivePricing(method, cfg?.pricingOverride), input);
}

export interface OrderTotals {
  currency: string;
  qty: number;
  productTotal: number;   // productBase × qty
  printTotal: number;     // setup + (unit + card) × qty
  sub: number;
  vat: number;
  delivery: number;
  grand: number;          // what the customer sees
}

/**
 * Customer-facing order total. The per-method breakdown stays internal (admin);
 * the customer only sees product + customization + VAT + delivery = grand.
 * Example: product 20 × 10 = 200, printing 15/item × 10 = 150 → sub 350 (+VAT +delivery).
 */
export interface PartCost {
  partId: string;
  methodId: string;
  setup: number;
  unit: number;
  total: number; // setup + unit × qty
}

/**
 * Multi-area order total — sums every PRINTED part (parts with 0 elements are free).
 * Each part is priced by ITS method + area + colours + elements, then × qty.
 * Example: bottle body (UV 360) + bamboo lid (laser) → bodyCost + lidCost, summed.
 */
export function computeMultiAreaTotals(
  parts: Array<{
    partId: string;
    method: PrintingMethod;
    pricing: PricingModel;
    areaCm2: number;
    colors?: number;
    elements: number;
  }>,
  opts: { productBase: number; qty: number; perElement?: number; cardPrice?: number; vatPct?: number; delivery?: number; currency?: string }
): { currency: string; qty: number; productTotal: number; partCosts: PartCost[]; printTotal: number; card: number; sub: number; vat: number; delivery: number; grand: number } {
  const r = (n: number) => Math.round(n * 100) / 100;
  const qty = Math.max(1, opts.qty);
  const partCosts: PartCost[] = [];
  for (const p of parts) {
    if (!p.elements) continue; // not printed → not charged
    let unit = p.pricing.perUnit ?? 0;
    if (p.method.colorModel === "spot") unit += (p.pricing.perColor ?? 0) * (p.colors ?? 1);
    if (p.pricing.perCm2) unit += p.pricing.perCm2 * p.areaCm2;
    unit += (opts.perElement ?? 0) * p.elements;
    const setup = p.pricing.setup ?? 0;
    partCosts.push({ partId: p.partId, methodId: p.method.id, setup: r(setup), unit: r(unit), total: r(setup + unit * qty) });
  }
  const printTotal = r(partCosts.reduce((s, c) => s + c.total, 0));
  const card = r((opts.cardPrice ?? 0) * qty);
  const productTotal = r(opts.productBase * qty);
  const sub = r(productTotal + printTotal + card);
  const vat = r((sub * (opts.vatPct ?? 0)) / 100);
  const delivery = r(opts.delivery ?? 0);
  return { currency: opts.currency ?? DEFAULT_CURRENCY, qty, productTotal, partCosts, printTotal, card, sub, vat, delivery, grand: r(sub + vat + delivery) };
}

export function computeOrderTotals(
  method: PrintingMethod,
  pricing: PricingModel,
  opts: {
    productBase: number;
    qty: number;
    areaCm2: number;
    colors?: number;
    elements?: number;   // number of design elements placed
    perElement?: number; // charge added per element, per item
    cardPrice?: number;  // per unit, 0 if no card
    vatPct?: number;
    delivery?: number;
    currency?: string;
  }
): OrderTotals {
  const r = (n: number) => Math.round(n * 100) / 100;
  const qty = Math.max(1, opts.qty);
  const per = computePrice(method, pricing, { colors: opts.colors, areaCm2: opts.areaCm2, qty });
  const elementsUnit = (opts.perElement || 0) * (opts.elements || 0); // each element adds to the per-item print cost
  const card = (opts.cardPrice || 0) * qty;
  const printTotal = r(per.setup + (per.unit + elementsUnit) * qty + card);
  const productTotal = r(opts.productBase * qty);
  const sub = r(productTotal + printTotal);
  const vat = r((sub * (opts.vatPct ?? 0)) / 100);
  const delivery = r(opts.delivery ?? 0);
  return { currency: opts.currency ?? DEFAULT_CURRENCY, qty, productTotal, printTotal, sub, vat, delivery, grand: r(sub + vat + delivery) };
}
