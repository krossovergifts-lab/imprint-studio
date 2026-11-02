declare module "potrace" {
  type Cb = (err: Error | null, svg: string) => void;
  export function trace(input: Buffer | string, opts: Record<string, unknown>, cb: Cb): void;
  export function posterize(input: Buffer | string, opts: Record<string, unknown>, cb: Cb): void;
  const _default: { trace: typeof trace; posterize: typeof posterize };
  export default _default;
}
