import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog-sync";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET /api/catalog — the live product list for the admin Product Manager.
 * Merges the fetched Krossover catalog (dynamic) with each product's customization
 * setup status (stored by Studio, keyed by SKU). `?force=1` bypasses the cache.
 */
export async function GET(req: Request) {
  const force = new URL(req.url).searchParams.get("force") === "1";
  const items = await getCatalog(force);

  let readySkus = new Set<string>();
  if (prisma) {
    const rows = await prisma.product.findMany({ select: { sku: true } });
    readySkus = new Set(rows.map((r) => r.sku));
  }

  return NextResponse.json({
    count: items.length,
    refreshedAt: new Date().toISOString(),
    products: items.map((p) => ({ ...p, customizationReady: readySkus.has(p.sku) })),
  });
}
