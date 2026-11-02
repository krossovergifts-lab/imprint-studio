import { NextResponse } from "next/server";
import { screenUpload } from "@/lib/screening";
import { removeBackground } from "@/lib/bg-removal";
import { vectorizeToSvg } from "@/lib/vectorize";
import { putBuffer } from "@/lib/storage";
import crypto from "crypto";

export const runtime = "nodejs";

// POST /api/process-image (multipart: file, [removeBg=1], [vectorize=1])
// Screens -> optional bg removal -> optional vectorize -> stores -> returns urls.
export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "no_file" }, { status: 400 });
  let buf = Buffer.from(await file.arrayBuffer());

  const screen = await screenUpload(buf, file.type);
  if (!screen.ok) return NextResponse.json({ error: "rejected", reason: screen.reason }, { status: 422 });

  if (form.get("removeBg") === "1") {
    try { buf = await removeBackground(buf); } catch (e) { /* keep original on failure */ }
  }

  const base = `uploads/${crypto.randomUUID()}`;
  const url = await putBuffer(`${base}.png`, buf, "image/png");

  let svgUrl: string | undefined;
  if (form.get("vectorize") === "1") {
    try {
      const svg = await vectorizeToSvg(buf);
      svgUrl = await putBuffer(`${base}.svg`, Buffer.from(svg), "image/svg+xml");
    } catch { /* vectorize is best-effort */ }
  }

  return NextResponse.json({ url, svgUrl, width: screen.width, height: screen.height }, { status: 201 });
}
