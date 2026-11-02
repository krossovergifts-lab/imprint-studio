/**
 * Seed the database from the in-repo sample products.
 *   npx prisma migrate dev   # create tables
 *   npx prisma db seed       # run this
 */
import { PrismaClient } from "@prisma/client";
import { SEED_PRODUCTS } from "../src/lib/seed-products";

const prisma = new PrismaClient();

async function main() {
  for (const p of SEED_PRODUCTS) {
    await prisma.product.upsert({
      where: { id: p.id },
      create: { id: p.id, sku: p.sku, name: p.name, type: p.type, material: p.material, methods: p.methods as any, views: p.views as any },
      update: { sku: p.sku, name: p.name, type: p.type, material: p.material, methods: p.methods as any, views: p.views as any },
    });
    console.log("seeded", p.sku);
  }
}
main().finally(() => prisma.$disconnect());
