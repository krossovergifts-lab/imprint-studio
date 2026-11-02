/**
 * Prisma client singleton. Falls back to seed data when DATABASE_URL is unset,
 * so the demo runs with zero infra; set DATABASE_URL to go live.
 */
import { PrismaClient } from "@prisma/client";
import { SEED_PRODUCTS } from "./seed-products";
import type { Product } from "./types";

export const DB_ENABLED = !!process.env.DATABASE_URL;

const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma: PrismaClient | null = DB_ENABLED ? (g.prisma ?? new PrismaClient()) : null;
if (DB_ENABLED && process.env.NODE_ENV !== "production") g.prisma = prisma!;

/** Product reads used by the API — DB when configured, seed otherwise. */
export const products = {
  async list(): Promise<Product[]> {
    if (!prisma) return SEED_PRODUCTS;
    return (await prisma.product.findMany()) as unknown as Product[];
  },
  async find(id: string): Promise<Product | null> {
    if (!prisma) return SEED_PRODUCTS.find((p) => p.id === id) ?? null;
    return (await prisma.product.findUnique({ where: { id } })) as unknown as Product | null;
  },
  async upsert(p: Product): Promise<Product> {
    if (!prisma) return p; // demo: no-op
    const data = { sku: p.sku, name: p.name, type: p.type, material: p.material, methods: p.methods as any, views: p.views as any, pricing: (p as any).pricing ?? null };
    return (await prisma.product.upsert({ where: { id: p.id }, create: { id: p.id, ...data }, update: data })) as unknown as Product;
  },
};
