/**
 * Convert an RGB print PDF to CMYK using Ghostscript (install `gs` on the host).
 * No-op passthrough when ENABLE_CMYK is off or gs is missing — keep RGB for digital proofs.
 */
import { spawn } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

export async function toCmyk(pdf: Uint8Array): Promise<Uint8Array> {
  if (process.env.ENABLE_CMYK !== "1") return pdf;
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "ko-cmyk-"));
  const inPath = path.join(dir, "in.pdf"), outPath = path.join(dir, "out.pdf");
  await fs.writeFile(inPath, Buffer.from(pdf));
  await new Promise<void>((res, rej) => {
    const gs = spawn("gs", [
      "-dSAFER", "-dBATCH", "-dNOPAUSE", "-sDEVICE=pdfwrite",
      "-sProcessColorModel=DeviceCMYK", "-sColorConversionStrategy=CMYK",
      `-sOutputFile=${outPath}`, inPath,
    ]);
    gs.on("error", rej);
    gs.on("close", (c) => (c === 0 ? res() : rej(new Error("gs exit " + c))));
  });
  const out = await fs.readFile(outPath);
  await fs.rm(dir, { recursive: true, force: true });
  return new Uint8Array(out);
}
