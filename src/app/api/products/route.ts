import { NextResponse } from "next/server";
import { products } from "@/lib/db";

// GET /api/products — list personalizable products (DB when configured, seed otherwise)
export async function GET() {
  return NextResponse.json(await products.list());
}
