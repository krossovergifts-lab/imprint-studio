/**
 * Print-ready PDF from a flat art PNG: real trim size + bleed + corner crop marks.
 * RGB by default; pipe through CMYK conversion (src/lib/cmyk.ts) for true print colour.
 */
import { PDFDocument, rgb } from "pdf-lib";

const MM = 72 / 25.4;

export async function buildPrintPdf(png: Buffer, trimWmm: number, trimHmm: number, bleedMm = 3): Promise<Uint8Array> {
  const bw = (trimWmm + bleedMm * 2) * MM;
  const bh = (trimHmm + bleedMm * 2) * MM;
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([bw, bh]);
  const img = await pdf.embedPng(png);
  const b = bleedMm * MM;
  // artwork fills trim; bleed region around it should already contain extended art
  page.drawImage(img, { x: b, y: b, width: trimWmm * MM, height: trimHmm * MM });

  // corner crop marks (L-shapes at the trim corners, drawn into the bleed)
  const L = 6 * MM, g = 2 * MM, k = rgb(0, 0, 0), t = 0.4;
  const corners = [
    [b, b, 1, 1], [bw - b, b, -1, 1], [b, bh - b, 1, -1], [bw - b, bh - b, -1, -1],
  ] as const;
  for (const [x, y, sx, sy] of corners) {
    page.drawLine({ start: { x: x - sx * g, y }, end: { x: x - sx * (g + L), y }, thickness: t, color: k });
    page.drawLine({ start: { x, y: y - sy * g }, end: { x, y: y - sy * (g + L) }, thickness: t, color: k });
  }
  return pdf.save();
}
