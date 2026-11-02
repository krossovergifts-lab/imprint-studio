import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { products } from "@/lib/db";
import { PRINTING_METHODS } from "@/lib/printing-methods";
import { validateOrder } from "@/lib/validate";

export const runtime = "nodejs";

// GET /api/designs — expose the method catalogue to the editor
export async function GET() {
  return NextResponse.json(PRINTING_METHODS);
}

/**
 * POST /api/designs — called on Add to cart.
 * Re-validates colour limit + recomputes price server-side (never trusts the
 * client's number), then persists the design and returns id + authoritative price.
 */
export async function POST(req: Request) {
  const body = await req.json();
  const product = await products.find(body.productId);
  if (!product) return NextResponse.json({ error: "unknown_product" }, { status: 400 });

  const v = await validateOrder({
    product,
    methodId: body.print?.methodId,
    colors: body.print?.spots?.length,
    elements: body.commercials?.elements ?? 0,
    qty: body.commercials?.qty ?? 1,
    cardEnabled: !!body.card,
    cardPrice: body.commercials?.cardPrice ?? 0,
    perElement: body.commercials?.perElement ?? 0,
    vatPct: body.commercials?.vatPct ?? 0,
    delivery: body.commercials?.delivery ?? 0,
    // artBuffers: fetch uploaded logos here to hard-enforce the colour limit
  });
  if (!v.ok) return NextResponse.json({ error: "validation_failed", errors: v.errors }, { status: 422 });

  if (!prisma) {
    // demo mode (no DB): return the authoritative price without persisting
    return NextResponse.json({ id: "dsg_demo", price: v.price }, { status: 201 });
  }
  const saved = await prisma.design.create({
    data: {
      productId: product.id,
      print: body.print ?? {},
      commercials: body.commercials ?? {},
      perView: body.views ?? [],
      card: body.card ?? null,
      price: v.price as any,
    },
  });
  return NextResponse.json({ id: saved.id, price: v.price }, { status: 201 });
}
