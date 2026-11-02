/**
 * Spot-colour separations for screen printing.
 * Given the flat art and the chosen spot colours, emit one 1-bit film per colour
 * (each pixel assigned to its nearest spot). The print team burns one screen per film.
 *   npm i sharp
 */
import sharp from "sharp";

const hexToRgb = (h: string): [number, number, number] => {
  const s = h.replace("#", "");
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
};

export async function generateSeparations(artPng: Buffer, spots: string[]): Promise<{ color: string; png: Buffer }[]> {
  const { data, info } = await sharp(artPng).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const rgb = spots.map(hexToRgb);
  const masks = rgb.map(() => Buffer.alloc(info.width * info.height, 0));
  const ch = info.channels;
  for (let px = 0; px < info.width * info.height; px++) {
    const i = px * ch;
    if (data[i + 3] < 128) continue;
    let best = 0, bd = Infinity;
    rgb.forEach((c, idx) => {
      const d = (data[i] - c[0]) ** 2 + (data[i + 1] - c[1]) ** 2 + (data[i + 2] - c[2]) ** 2;
      if (d < bd) { bd = d; best = idx; }
    });
    masks[best][px] = 255;
  }
  return Promise.all(
    masks.map(async (mask, idx) => ({
      color: spots[idx],
      png: await sharp(mask, { raw: { width: info.width, height: info.height, channels: 1 } }).png().toBuffer(),
    }))
  );
}
