/**
 * Printing Methods registry — print options with their colour rules + pricing.
 *
 * Screen printing carries the colour-tier rule: 1 colour, 2 colour, full colour —
 * each a separate option with its own price, and a `limit` the editor enforces
 * (a multicolour logo is rejected under a 1- or 2-colour option). UV, UV-DTF and
 * Heat-Transfer (DTF, for cloth) are full colour and accept any image. Engraving
 * is mono; its look is substrate-driven (wood → burn brown, crystal → frosted).
 *
 * Products expose only the options they allow via ProductMethodConfig.
 */

import type { PrintingMethod, Material } from "./types";

export const PRINTING_METHODS: PrintingMethod[] = [
  { id: "screen1",    group: "Screen Printing",    label: "1 color",          limit: 1, allowsImage: true, effect: "ink",     colorModel: "spot", pricing: { setup: 25, perUnit: 3 } },
  { id: "screen2",    group: "Screen Printing",    label: "2 color",          limit: 2, allowsImage: true, effect: "ink",     colorModel: "spot", pricing: { setup: 40, perUnit: 5 } },
  { id: "screenfull", group: "Screen Printing",    label: "Full color",       limit: 0, allowsImage: true, effect: "ink",     colorModel: "full", pricing: { setup: 60, perUnit: 9 } },
  { id: "uvdtf",      group: "UV DTF Sticker",     label: "Full color",       limit: 0, allowsImage: true, effect: "uv",      colorModel: "full", pricing: { perUnit: 5, perCm2: 0.06 } },
  { id: "uv",         group: "UV Printing",        label: "Full color",       limit: 0, allowsImage: true, effect: "uv",      colorModel: "full", pricing: { perUnit: 6, perCm2: 0.07 } },
  { id: "dtf",        group: "Heat Transfer (DTF)",label: "Full color · cloth",limit: 0, allowsImage: true, effect: "uv",      colorModel: "full", pricing: { perUnit: 5, perCm2: 0.05 } },
  { id: "engrave",    group: "Engraving",          label: "Mono engrave",     limit: 1, allowsImage: true, effect: "engrave", colorModel: "mono", pricing: { setup: 15, perUnit: 4, perCm2: 0.09 } },
];

export const methodById = (id: string) => PRINTING_METHODS.find((m) => m.id === id);

/** Engraving look by substrate — wood burns brown, crystal/glass frosts, metal etches. */
export function engraveLook(material: Material): { tint: string; mode: "burn" | "frost" | "etch" } {
  if (material === "wood") return { tint: "#5a3a1a", mode: "burn" };
  if (material === "crystal" || material === "glass") return { tint: "#eef3f6", mode: "frost" };
  return { tint: "#c9ccd1", mode: "etch" };
}

/** Rough distinct-colour count of an RGBA buffer, used to enforce screen colour limits. */
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

/** True when an uploaded logo's colour count is allowed under the option. 0 = unlimited. */
export const colorsAllowed = (method: PrintingMethod, count: number) => method.limit === 0 || count <= method.limit;
