/**
 * Auto-vectorize a raster logo to SVG (potrace). Used to make uploaded logos
 * crisp for engraving / large-format and to prep single-colour screen output.
 *   npm i potrace
 */
import potrace from "potrace";

export function vectorizeToSvg(png: Buffer, opts: { color?: string; threshold?: number } = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    potrace.trace(png, { color: opts.color ?? "#000000", threshold: opts.threshold ?? 180, turdSize: 2 }, (err: Error | null, svg: string) =>
      err ? reject(err) : resolve(svg)
    );
  });
}

/** Posterized multi-colour vectorization (one path group per tone) for screen jobs. */
export function posterizeToSvg(png: Buffer, steps = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    potrace.posterize(png, { steps }, (err: Error | null, svg: string) => (err ? reject(err) : resolve(svg)));
  });
}
