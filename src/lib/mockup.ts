/**
 * AI product-mockup generation — provider-pluggable.
 *
 * Takes the flat print-file (as a data URL) + a product-locked prompt and returns
 * a photorealistic mockup of the product with the artwork applied. Pick a provider
 * with MOCKUP_PROVIDER and set its key in .env. All three are image-editing models,
 * so they condition on the print file rather than inventing the artwork.
 *
 *   MOCKUP_PROVIDER=gemini   GEMINI_API_KEY=...   (Nano Banana / Gemini 2.5 Flash Image)
 *   MOCKUP_PROVIDER=openai   OPENAI_API_KEY=...   (gpt-image-1 edits)
 *   MOCKUP_PROVIDER=fal      FAL_KEY=...          (fal-ai/nano-banana/edit)
 */

export interface MockupInput {
  prompt: string;
  printFileDataUrl?: string; // data:image/png;base64,....
  size?: string;             // e.g. "1024x1024"
}
export interface MockupResult {
  dataUrl?: string;
  url?: string;
}

function dataUrlToBase64(d?: string) {
  if (!d) return null;
  const i = d.indexOf(",");
  return i >= 0 ? d.slice(i + 1) : d;
}

export async function generateMockup(input: MockupInput): Promise<MockupResult> {
  const provider = (process.env.MOCKUP_PROVIDER || (process.env.GEMINI_API_KEY ? "gemini" : process.env.OPENAI_API_KEY ? "openai" : process.env.FAL_KEY ? "fal" : "")).toLowerCase();
  if (provider === "gemini") return gemini(input);
  if (provider === "openai") return openai(input);
  if (provider === "fal") return fal(input);
  throw new Error("No mockup provider configured. Set MOCKUP_PROVIDER and the matching API key.");
}

/* ---- Google Gemini 2.5 Flash Image ("Nano Banana") ---- */
async function gemini(input: MockupInput): Promise<MockupResult> {
  const key = process.env.GEMINI_API_KEY!;
  const parts: any[] = [{ text: input.prompt }];
  const b64 = dataUrlToBase64(input.printFileDataUrl);
  if (b64) parts.push({ inline_data: { mime_type: "image/png", data: b64 } });
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts }] }) }
  );
  const j = await res.json();
  const img = j?.candidates?.[0]?.content?.parts?.find((p: any) => p.inline_data || p.inlineData);
  const data = img?.inline_data?.data || img?.inlineData?.data;
  if (!data) throw new Error("Gemini returned no image: " + JSON.stringify(j).slice(0, 300));
  return { dataUrl: `data:image/png;base64,${data}` };
}

/* ---- OpenAI gpt-image-1 (edits conditioned on the print file) ---- */
async function openai(input: MockupInput): Promise<MockupResult> {
  const key = process.env.OPENAI_API_KEY!;
  const b64 = dataUrlToBase64(input.printFileDataUrl);
  // If we have a reference image, use the edits endpoint so the artwork is preserved.
  if (b64) {
    const form = new FormData();
    form.append("model", "gpt-image-1");
    form.append("prompt", input.prompt);
    form.append("size", input.size || "1024x1024");
    form.append("image", new Blob([Buffer.from(b64, "base64")], { type: "image/png" }), "print.png");
    const res = await fetch("https://api.openai.com/v1/images/edits", { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: form as any });
    const j = await res.json();
    const d = j?.data?.[0]?.b64_json;
    if (!d) throw new Error("OpenAI returned no image: " + JSON.stringify(j).slice(0, 300));
    return { dataUrl: `data:image/png;base64,${d}` };
  }
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-image-1", prompt: input.prompt, size: input.size || "1024x1024" }),
  });
  const j = await res.json();
  const d = j?.data?.[0]?.b64_json;
  if (!d) throw new Error("OpenAI returned no image: " + JSON.stringify(j).slice(0, 300));
  return { dataUrl: `data:image/png;base64,${d}` };
}

/* ---- fal.ai nano-banana edit ---- */
async function fal(input: MockupInput): Promise<MockupResult> {
  const key = process.env.FAL_KEY!;
  const body: any = { prompt: input.prompt };
  if (input.printFileDataUrl) body.image_urls = [input.printFileDataUrl];
  const res = await fetch("https://fal.run/fal-ai/nano-banana/edit", {
    method: "POST",
    headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await res.json();
  const url = j?.images?.[0]?.url;
  if (!url) throw new Error("fal returned no image: " + JSON.stringify(j).slice(0, 300));
  return { url };
}
