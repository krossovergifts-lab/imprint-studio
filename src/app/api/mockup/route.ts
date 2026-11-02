import { NextResponse } from "next/server";
import { generateMockup } from "@/lib/mockup";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/mockup — real-time AI product mockup from the print file + prompt.
// The editor calls this before Add to cart; the result is shown in the quote.
export async function POST(req: Request) {
  try {
    const { prompt, printFileDataUrl, size } = await req.json();
    if (!prompt) return NextResponse.json({ error: "missing_prompt" }, { status: 400 });
    const out = await generateMockup({ prompt, printFileDataUrl, size });
    return NextResponse.json(out);
  } catch (e: any) {
    return NextResponse.json({ error: "mockup_failed", detail: String(e?.message || e) }, { status: 502 });
  }
}
