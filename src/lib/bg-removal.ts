/**
 * Background removal — provider-pluggable, with a sharp white-key fallback.
 *   BG_PROVIDER=removebg  REMOVEBG_API_KEY=...
 *   BG_PROVIDER=imgly                        (local model, npm i @imgly/background-removal-node)
 *   (unset)                                   -> sharp near-white key (good for clean product shots)
 */
import sharp from "sharp";

export async function removeBackground(input: Buffer): Promise<Buffer> {
  const provider = process.env.BG_PROVIDER || (process.env.REMOVEBG_API_KEY ? "removebg" : "");
  if (provider === "removebg") return removebg(input);
  if (provider === "imgly") return imgly(input);
  return whiteKey(input);
}

async function removebg(input: Buffer): Promise<Buffer> {
  const form = new FormData();
  form.append("image_file", new Blob([input]));
  form.append("size", "auto");
  const res = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": process.env.REMOVEBG_API_KEY! },
    body: form as any,
  });
  if (!res.ok) throw new Error("remove.bg " + res.status);
  return Buffer.from(await res.arrayBuffer());
}

async function imgly(input: Buffer): Promise<Buffer> {
  // dynamic import so the heavy model isn't bundled unless used
  const { removeBackground } = await import("@imgly/background-removal-node");
  const blob = await removeBackground(input as any);
  return Buffer.from(await blob.arrayBuffer());
}

/** Near-white -> transparent, for clean studio product photos. */
async function whiteKey(input: Buffer, thresh = 238): Promise<Buffer> {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > thresh && data[i + 1] > thresh && data[i + 2] > thresh) data[i + 3] = 0;
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}
