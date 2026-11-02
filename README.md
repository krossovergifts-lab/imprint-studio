# Krossover Studio

A headless, embeddable product-personalization engine for Krossover. Customers design inside a product's real-size print area, pick a printing method, see one final price, and the result becomes a print-ready file plus a cart line. Built to live on every product page across the five Krossover sub-brands, owned outright (no per-sale fees).

> **Status:** the application is complete and runs locally on seed data with zero setup. Going live is a provisioning job (database, storage, keys, your Krossover API) — see `GO-LIVE.md`.

---

## Run it now

```bash
npm install
npm run dev          # http://localhost:3000
```

- `/` — overview; links to both sides
- `/manager` — **Admin** Product Manager: all 917 products, per-product customization setup
- `/admin` — Admin pricing + method toggles
- `/studio` — **Customer** Design Studio: product pre-set-up, artwork tools only, final price only
- `/preview3d` — rotatable 3D product with live artwork

No database needed to explore; it runs on the bundled catalogue + seed.

---

## How admin and customer differ (important)

**Admin (backend only) — prepares every product.** You set up each of the ~917 Krossover products once: its print-ready product image, the print area/border, the allowed printing methods, and the prices. These tools live only in the admin Product Manager. The product list is **fetched live from the Krossover website** (`src/lib/catalog-sync.ts`, `GET /api/catalog`) and auto-refreshes, because inventory (stock, new products) changes daily. Studio stores only the customization setup, keyed by SKU (Model Number) — it never copies or edits the product price or stock.

**Customer (on the website) — designs only.** The customer cannot upload a product photo or change the setup — the product image, print area, and allowed methods are fetched from what the admin prepared. They design inside the fixed area with only the allowed methods, see only the final price, and the only thing they can upload is their own logo (which triggers background removal).

## What it does (the complete plan, built)

**The editor** (`public/editor.html`) — flat and cylindrical (360°, front/left/right) products; real product vs print-area dimensions; drag-to-mark print boundary with live clip; text with Google Fonts + full tools (size, spacing, bold/italic/underline, alignment, Arabic/RTL); image/logo upload with auto background-removal; predefined shapes; per-method print-effect previews; whole-product masked preview; AI mockup + message card; invoice-style quote; add-to-cart payload.

**Printing methods engine** (`src/lib/printing-methods.ts`) — Screen (1 / 2 / full colour, with real colour-limit enforcement), UV, UV-DTF, Heat-Transfer (DTF, cloth), Engraving (substrate-driven look). Products expose only the methods they allow.

**Pricing engine** (`src/lib/pricing.ts`) — the customer sees one final number; the breakdown stays admin-side. Total = product (`base × qty`) + customization (`setup + (unit + perElement × elements + card) × qty`) + VAT + delivery. Recomputed server-side so it can't be faked.

**Production layers** —
- Persistence: Prisma + Postgres (`prisma/`, `src/lib/db.ts`), admin auth, S3/R2 storage.
- Render: print PDF with bleed + crop marks, spot-colour separations, CMYK, vectorize.
- Image: background removal (remove.bg / IMG.LY / sharp), potrace vectorize.
- Trust: server-side price + colour re-validation, upload screening + moderation hook.
- 3D: `public/viewer3d.html` + `/preview3d`, GLB-ready.

**API** (`src/app/api/*`) — products (list / by id / save), designs (save + validate), render, process-image, mockup, quote.

**Integration** — `public/embed.js` mounts the editor on any product page; `INTEGRATION-SPEC` doc + `GO-LIVE.md` Stage 9 define the Krossover connection.

---

## Map of the code

```
src/lib/
  types.ts              domain model
  printing-methods.ts   methods + colour rules + countColors/colorsAllowed
  pricing.ts            computePrice + computeOrderTotals
  seed-products.ts      sample products (per-product allowed methods)
  db.ts                 Prisma client (falls back to seed)
  storage.ts            S3/R2 asset storage (falls back to local)
  auth.ts               admin bearer auth
  bg-removal.ts         provider-pluggable + sharp fallback
  vectorize.ts          potrace raster->SVG
  screening.ts          upload size/type + moderation hook
  validate.ts           server-side price + colour re-validation
  print-pdf.ts          bleed + crop marks
  separations.ts        one film per spot colour (screen)
  cmyk.ts               RGB->CMYK via ghostscript
  mockup.ts             AI mockup (gemini / openai / fal)
  quote.ts              invoice-format quote PDF
src/app/
  page.tsx  editor/  admin/  preview3d/
  api/products  api/designs  api/process-image  api/mockup  api/quote
public/
  editor.html  viewer3d.html  embed.js
prisma/
  schema.prisma  seed.ts
GO-LIVE.md              step-by-step to production
.env.local.template     every key, commented by stage
```

---

## Going live

Read **`GO-LIVE.md`** — nine staged steps, each saying what it unlocks and whether it's required. Minimum to launch: database + storage + admin key + print output. Then deploy to Vercel and wire the three Krossover endpoints in the integration spec.

---

## Honest boundaries

- Runs on fallbacks everywhere, so it works before any key is added — and that also means each real provider (DB, storage, AI, moderation, CMYK) must be wired and tested before production.
- The cylindrical preview and 3D are approximations until per-product warp maps / GLB models are added.
- Every print size, colour separation, and price total needs your QA against real products before customers see them. The engine is built; the numbers are yours to sign off.
