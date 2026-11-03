/**
 * Printing Methods registry — the canonical Krossover techniques.
 *
 * Screen printing carries the colour-tier rule (1 / 2 / 3+ colour, each priced
 * separately, `limit` enforced). UV (flat-bed and 360 rotary), UV-DTF, Heat-Transfer
 * (DTF), Sublimation are full colour. Laser is mono engrave (look is substrate-driven).
 *
 * New methods can be added here (or, at runtime, stored in the DB as CustomMethod and
 * merged with this list) — the editor and pricing read whatever list they're given, so
 * adding a technology is data, not code.
 */
import type { PrintingMethod, Material } from "./types";

export const PRINTING_METHODS: PrintingMethod[] = [
  { id: "screen1", group: "Screen Printing",         label: "1 color",   limit: 1, allowsImage: true, colorModel: "spot", effect: "ink",     pricing: { setup: 25, perUnit: 3 } },
  { id: "screen2", group: "Screen Printing",         label: "2 color",   limit: 2, allowsImage: true, colorModel: "spot", effect: "ink",     pricing: { setup: 40, perUnit: 5 } },
  { id: "screen3", group: "Screen Printing",         label: "3+ colors", limit: 3, allowsImage: true, colorModel: "spot", effect: "ink",     pricing: { setup: 60, perUnit: 8 } },
  { id: "uvflat",  group: "UV Printing (Flat Bed)",  label: "Full color",limit: 0, allowsImage: true, colorModel: "full", effect: "uv",      pricing: { perUnit: 6, perCm2: 0.07 } },
  { id: "uv360",   group: "UV Printing (360 Rotary)",label: "Full color",limit: 0, allowsImage: true, colorModel: "full", effect: "uv",      pricing: { perUnit: 8, perCm2: 0.08 } },
  { id: "uvdtf",   group: "UV DTF Sticker",          label: "Full color",limit: 0, allowsImage: true, colorModel: "full", effect: "uv",      pricing: { perUnit: 5, perCm2: 0.06 } },
  { id: "dtf",     group: "Heat Transfer (DTF)",     label: "Full color",limit: 0, allowsImage: true, colorModel: "full", effect: "uv",      pricing: { perUnit: 5, perCm2: 0.05 } },
  { id: "subl",    group: "Sublimation",             label: "Full color",limit: 0, allowsImage: true, colorModel: "full", effect: "uv",      pricing: { perUnit: 5, perCm2: 0.05 } },
  { id: "laser",   group: "Laser Engraving",         label: "Mono",      limit: 1, allowsImage: true, colorModel: "mono", effect: "engrave", pricing: { setup: 15, perUnit: 4, perCm2: 0.09 } },
];

export const methodById = (id: string, extra: PrintingMethod[] = []) =>
  [...PRINTING_METHODS, ...extra].find((m) => m.id === id);

/**
 * Default allowed methods by product category — a starting point the admin can
 * override per product. Mirrors Krossover's real rules (bags → screen + DTF, etc.).
 */
export const CATEGORY_METHOD_DEFAULTS: Record<string, string[]> = {
  "Office Supplies": ["laser", "screen1", "screen2", "uvflat", "uvdtf"],        // pens, notebooks
  "Technology": ["laser", "screen1", "screen2", "uvflat", "uvdtf"],            // powerbanks, cables, gadgets
  "Bag": ["screen1", "screen2", "screen3", "dtf"],                              // cotton/cloth → DTF
  "Eco Friendly": ["screen1", "screen2", "uvdtf", "dtf"],
  "Award and Trophy": ["laser", "uvflat", "uvdtf"],                            // crystal/wood/stone
  "Drinkware": ["laser", "uv360", "uvflat", "uvdtf", "subl", "screen1"],       // bottles, mugs, coasters
  "Promotional and Other Gifts": ["screen1", "screen2", "uvflat", "uvdtf", "laser"],
  "Football Edition": ["screen1", "screen2", "dtf", "subl"],
  "Kids Collection": ["dtf", "subl", "uvdtf"],
  "UAE National Day Collection": ["screen1", "screen2", "uvflat", "uvdtf", "laser"],
  "Maison Valer": ["laser", "uvflat", "uvdtf"],
};
export const defaultMethodsFor = (category: string) => CATEGORY_METHOD_DEFAULTS[category] || ["screen1", "uvflat", "uvdtf"];

/** Engraving look by substrate — wood burns brown, crystal/glass frosts, metal etches. */
export function engraveLook(material: Material): { tint: string; mode: "burn" | "frost" | "etch" } {
  if (material === "wood") return { tint: "#5a3a1a", mode: "burn" };
  if (material === "crystal" || material === "glass") return { tint: "#eef3f6", mode: "frost" };
  return { tint: "#c9ccd1", mode: "etch" };
}

/** Rough distinct-colour count of an RGBA buffer, to enforce screen colour limits. */
export function countColors(rgba: Uint8ClampedArray): number {
  const counts: Record<string, number> = {};
  let tot = 0;
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] < 128) continue;
    tot++;
    const k = (rgba[i] >> 5) + "," + (rgba[i + 1] >> 5) + "," + (rgba[i + 2] >> 5);
    counts[k] = (counts[k] || 0) + 1;
  }
  if (!tot) return 0;
  return Object.values(counts).filter((c) => c > tot * 0.02).length;
}

export const colorsAllowed = (method: PrintingMethod, count: number) => method.limit === 0 || count <= method.limit;
