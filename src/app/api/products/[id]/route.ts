import { NextResponse } from "next/server";
import { products } from "@/lib/db";
import { requireAdmin, AuthError } from "@/lib/auth";

// GET /api/products/:id — editor loads this on product-page mount
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const product = await products.find(params.id);
  if (!product) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(product);
}

// PUT /api/products/:id — admin saves template + allowed methods + pricing
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin(req);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const saved = await products.upsert({ ...body, id: params.id });
  return NextResponse.json(saved);
}
