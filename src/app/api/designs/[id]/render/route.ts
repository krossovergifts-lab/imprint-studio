import { NextResponse } from "next/server";
import { buildPrintPdf } from "@/lib/print-pdf";
import { toCmyk } from "@/lib/cmyk";
import { generateSeparations } from "@/lib/separations";
import { putBuffer } from "@/lib/storage";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/designs/:id/render
 * Body: { printFileDataUrl, realWidthMm, realHeightMm, bleedMm?, spots? }
 * Produces the print-ready PDF (bleed + crop marks, optional CMYK) and, for screen
 * jobs, one separation film per spot colour. Stores them and returns the URLs.
 *
 * printFileDataUrl is the flat art the editor produced; a fuller build re-renders
 * it from the saved design JSON with fabric/node so production can't be tampered with.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json();
  const png = Buffer.from((b.printFileDataUrl || "").split(",")[1] || "", "base64");
  if (!png.length) return NextResponse.json({ error: "no_art" }, { status: 400 });

  const pdf = await toCmyk(await buildPrintPdf(png, b.realWidthMm, b.realHeightMm, b.bleedMm ?? 3));
  const pdfRef = await putBuffer(`print/${params.id}/artwork.pdf`, Buffer.from(pdf), "application/pdf");

  const separations: Record<string, string> = {};
  if (Array.isArray(b.spots) && b.spots.length) {
    const films = await generateSeparations(png, b.spots);
    for (let i = 0; i < films.length; i++) {
      separations[films[i].color] = await putBuffer(`print/${params.id}/sep-${i + 1}.png`, films[i].png, "image/png");
    }
  }
  return NextResponse.json({ pdfRef, separations });
}
