/**
 * Asset storage — S3-compatible (AWS S3, Cloudflare R2, DigitalOcean Spaces).
 * Put a buffer, get back a public URL. Falls back to a local /public/uploads
 * folder in dev when S3 env vars are absent.
 *
 *   npm i @aws-sdk/client-s3
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const S3_ENABLED = !!(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY);
const s3 = S3_ENABLED
  ? new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: { accessKeyId: process.env.S3_ACCESS_KEY!, secretAccessKey: process.env.S3_SECRET_KEY! },
    })
  : null;

export async function putBuffer(key: string, body: Buffer, contentType: string): Promise<string> {
  if (s3) {
    await s3.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key, Body: body, ContentType: contentType }));
    const base = process.env.S3_PUBLIC_URL || `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}`;
    return `${base}/${key}`;
  }
  // local dev fallback
  const dir = path.join(process.cwd(), "public", "uploads", path.dirname(key));
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(process.cwd(), "public", "uploads", key), body);
  return `/uploads/${key}`;
}

export const putDataUrl = (prefix: string, dataUrl: string, kind = "png") => {
  const b64 = dataUrl.split(",")[1] || dataUrl;
  const key = `${prefix}/${crypto.randomUUID()}.${kind}`;
  return putBuffer(key, Buffer.from(b64, "base64"), kind === "png" ? "image/png" : "application/octet-stream");
};
