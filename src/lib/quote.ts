/**
 * Quotation / invoice PDF builder.
 *
 * Produces a one-page customization quote: Krossover header, product + method,
 * print dimensions, price breakdown, and thumbnails of the print file and the
 * AI mockup. Use for the customer's "Download quote" and the sales/factory handoff.
 *
 *   npm i pdf-lib
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PriceBreakdown } from "./types";

export interface QuoteInput {
  ref: string;
  date: string;
  productName: string;
  sku?: string;
  productType: string;
  material: string;
  methodLabel: string;
  colors?: number | null;
  realWidthMm: number;
  realHeightMm: number;
  dpi: number;
  qty: number;
  price: PriceBreakdown;
  printFilePng?: Uint8Array; // the flat print file
  mockupPng?: Uint8Array;    // the AI/product mockup
}

const b64 = (d?: string) => (d ? Uint8Array.from(Buffer.from(d.split(",")[1] || d, "base64")) : undefined);
export const dataUrlToPng = b64;

export async function buildQuotePdf(q: QuoteInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const navy = rgb(0.059, 0.153, 0.282);
  const ink = rgb(0.12, 0.16, 0.22);
  const muted = rgb(0.46, 0.53, 0.63);

  // header band
  page.drawRectangle({ x: 0, y: 782, width: 595, height: 60, color: navy });
  page.drawText("Krossover", { x: 40, y: 812, size: 18, font: bold, color: rgb(1, 1, 1) });
  page.drawText("Customization Quote", { x: 40, y: 794, size: 10, font, color: rgb(0.8, 0.86, 0.95) });
  page.drawText(`Ref ${q.ref}`, { x: 420, y: 812, size: 10, font, color: rgb(1, 1, 1) });
  page.drawText(q.date, { x: 420, y: 798, size: 10, font, color: rgb(0.8, 0.86, 0.95) });

  // thumbnails
  let y = 700;
  const putImg = async (png: Uint8Array | undefined, x: number, label: string) => {
    page.drawText(label, { x, y: y + 118, size: 9, font: bold, color: muted });
    if (!png) return;
    const img = await pdf.embedPng(png);
    const w = 240, h = (img.height / img.width) * w;
    page.drawImage(img, { x, y: y + 110 - Math.min(h, 110), width: w, height: Math.min(h, 110) });
  };
  await putImg(q.printFilePng, 40, "PRINT FILE");
  await putImg(q.mockupPng, 310, "PRODUCT MOCKUP");

  // details
  y = 560;
  const row = (k: string, v: string) => {
    page.drawText(k, { x: 40, y, size: 11, font, color: muted });
    page.drawText(v, { x: 555 - bold.widthOfTextAtSize(v, 11), y, size: 11, font: bold, color: ink });
    y -= 22;
  };
  row("Product", `${q.productName}${q.sku ? "  (" + q.sku + ")" : ""}`);
  row("Type / material", `${q.productType} · ${q.material}`);
  row("Print method", `${q.methodLabel}${q.colors ? " · " + q.colors + " color" : ""}`);
  row("Print size", `${q.realWidthMm} × ${q.realHeightMm} mm @ ${q.dpi} DPI`);
  row("Quantity", String(q.qty));

  // price box
  y -= 8;
  page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 0.5, color: rgb(0.86, 0.9, 0.95) });
  y -= 24;
  const money = (n: number) => `${q.price.currency} ${n.toFixed(2)}`;
  row("Setup", money(q.price.setup));
  row("Per item", money(q.price.unit));
  page.drawText("Customization total", { x: 40, y, size: 13, font: bold, color: navy });
  const tot = money(q.price.total);
  page.drawText(tot, { x: 555 - bold.widthOfTextAtSize(tot, 13), y, size: 13, font: bold, color: navy });

  page.drawText("Krossover Gifts Trading LLC · kross-over.net", { x: 40, y: 40, size: 9, font, color: muted });
  return pdf.save();
}
