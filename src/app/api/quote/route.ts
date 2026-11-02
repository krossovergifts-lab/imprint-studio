import { buildQuotePdf, dataUrlToPng } from "@/lib/quote";

export const runtime = "nodejs";

// POST /api/quote — returns an invoice-format PDF for the customization.
// Body: { ref?, productName, sku?, productType, material, methodLabel, colors?,
//         realWidthMm, realHeightMm, dpi, qty, price, printFileDataUrl?, mockupDataUrl? }
export async function POST(req: Request) {
  const b = await req.json();
  const pdf = await buildQuotePdf({
    ref: b.ref || "KO-" + Date.now().toString().slice(-6),
    date: b.date || new Date().toLocaleDateString(),
    productName: b.productName || "Custom product",
    sku: b.sku,
    productType: b.productType || "",
    material: b.material || "",
    methodLabel: b.methodLabel || "",
    colors: b.colors ?? null,
    realWidthMm: b.realWidthMm, realHeightMm: b.realHeightMm, dpi: b.dpi,
    qty: b.qty ?? 1,
    price: b.price,
    printFilePng: dataUrlToPng(b.printFileDataUrl),
    mockupPng: dataUrlToPng(b.mockupDataUrl),
  });
  return new Response(Buffer.from(pdf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="krossover-quote.pdf"` },
  });
}
