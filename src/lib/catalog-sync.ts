/**
 * Catalog sync — fetches the live Krossover product list and keeps it fresh.
 *
 * Krossover inventory is dynamic (stock changes daily, products are added/removed),
 * so the Studio never stores a frozen product list. It fetches from the website
 * backend and refreshes on an interval. Customization setup (print image, area,
 * methods, prices) is the ONLY thing Studio stores, keyed by SKU (Model Number).
 *
 * Point KROSSOVER_PRODUCTS_URL at your live endpoint. With it unset, the bundled
 * snapshot (src/data/catalog.json, exported from FINAL_PRODUCTS-2027.xlsx) is used
 * so the admin works offline.
 */
import snapshot from "../data/catalog.json";

export interface CatalogProduct {
  sku: string;          // Model Number — the join key
  name: string;
  category: string;
  subCategory?: string;
  subType?: string;
  priceB2B?: number | null;
  priceB2C?: number | null; // the customer price
  stock: number;            // dynamic — refreshed from the website
}

const REFRESH_MS = Number(process.env.CATALOG_REFRESH_MS || 15 * 60 * 1000); // 15 min
let cache: { at: number; items: CatalogProduct[] } | null = null;

/** Map one row from the Krossover products API to our CatalogProduct. Adjust the
 *  field names here to match the real API response (see INTEGRATION-SPEC). */
function fromKrossover(r: any): CatalogProduct {
  return {
    sku: String(r.modelNumber ?? r.sku ?? r.model ?? "").trim(),
    name: r.name ?? r.productName ?? "",
    category: r.category ?? "",
    subCategory: r.subCategory ?? r.subCate,
    subType: r.subType,
    priceB2B: r.priceB2B ?? r.b2b ?? null,
    priceB2C: r.priceB2C ?? r.b2c ?? r.price ?? null,
    stock: Number(r.stock ?? 0),
  };
}

export async function getCatalog(force = false): Promise<CatalogProduct[]> {
  if (!force && cache && Date.now() - cache.at < REFRESH_MS) return cache.items;

  const url = process.env.KROSSOVER_PRODUCTS_URL;
  if (url) {
    try {
      const res = await fetch(url, { headers: krossoverHeaders(), next: { revalidate: 0 } });
      const data = await res.json();
      const items = (Array.isArray(data) ? data : data.products || []).map(fromKrossover).filter((p: CatalogProduct) => p.sku);
      cache = { at: Date.now(), items };
      return items;
    } catch {
      // fall through to snapshot on a fetch error, so the admin never goes blank
    }
  }
  const items = (snapshot as any[]).map((p) => ({ ...p, stock: Number(p.stock ?? 0) })) as CatalogProduct[];
  cache = { at: Date.now(), items };
  return items;
}

export async function getCatalogProduct(sku: string): Promise<CatalogProduct | null> {
  const items = await getCatalog();
  return items.find((p) => p.sku === sku) ?? null;
}

function krossoverHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  if (process.env.KROSSOVER_API_KEY) h.Authorization = `Bearer ${process.env.KROSSOVER_API_KEY}`;
  return h;
}
