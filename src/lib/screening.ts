/**
 * Upload screening — size/type/dimension limits + a pluggable moderation hook
 * (NSFW / IP). Call before accepting a customer image; reject on the first failure.
 */
import sharp from "sharp";

const MAX_BYTES = 15 * 1024 * 1024;
const OK_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export interface ScreenResult { ok: boolean; reason?: string; width?: number; height?: number }

export async function screenUpload(buf: Buffer, mime: string): Promise<ScreenResult> {
  if (!OK_TYPES.includes(mime)) return { ok: false, reason: "Unsupported file type. Use PNG, JPG, WEBP or SVG." };
  if (buf.length > MAX_BYTES) return { ok: false, reason: "File too large (max 15 MB)." };
  let meta;
  try { meta = await sharp(buf).metadata(); } catch { return { ok: false, reason: "Could not read the image." }; }
  if ((meta.width ?? 0) < 50 || (meta.height ?? 0) < 50) return { ok: false, reason: "Image too small to print." };
  if ((meta.width ?? 0) > 12000 || (meta.height ?? 0) > 12000) return { ok: false, reason: "Image dimensions too large." };

  const mod = await moderate(buf, mime);
  if (!mod.ok) return mod;
  return { ok: true, width: meta.width, height: meta.height };
}

/**
 * Moderation hook. Wire to your provider (Sightengine, AWS Rekognition, Hive,
 * OpenAI moderation for OCR'd text). No-op pass when MODERATION_URL is unset.
 */
async function moderate(buf: Buffer, mime: string): Promise<ScreenResult> {
  const url = process.env.MODERATION_URL;
  if (!url) return { ok: true };
  try {
    const form = new FormData();
    form.append("file", new Blob([buf], { type: mime }));
    const res = await fetch(url, { method: "POST", headers: process.env.MODERATION_KEY ? { Authorization: `Bearer ${process.env.MODERATION_KEY}` } : undefined, body: form as any });
    const j = await res.json();
    if (j.flagged || j.nsfw_score > 0.7) return { ok: false, reason: "This image can't be accepted. Please use a different one." };
  } catch {
    /* fail open on provider error, but log in production */
  }
  return { ok: true };
}
