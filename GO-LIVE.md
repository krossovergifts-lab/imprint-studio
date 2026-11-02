# Krossover Studio — Go-Live Guide

Everything to take this from the repo to a live customizer on kross-over.net. Follow top to bottom. Each step says what it unlocks and whether it's required or optional.

---

## Stage 0 — Run it locally (5 minutes, no accounts)

```bash
npm install
npm run dev
```
Open http://localhost:3000. Editor, admin, 3D preview, and the pricing/methods engines all work on seed data. Nothing is saved yet — that's Stage 1.

---

## Stage 1 — Database (required for saving anything)

Products, designs, and orders need a Postgres database.

1. Create a free Postgres at **neon.tech** (or Supabase / your RDS).
2. Copy the connection string into `.env.local`:
   ```
   DATABASE_URL=postgresql://user:pass@host.neon.tech/krossover?sslmode=require
   ```
3. Create the tables and seed the sample products:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate      # name it "init" when asked
   npm run db:seed
   ```
Now products and designs persist. Unlocks: admin edits save, Add-to-cart records designs.

---

## Stage 2 — Asset storage (required for uploads + print files)

Customer uploads and rendered print files need somewhere to live.

1. Create a bucket on **Cloudflare R2** (cheapest), AWS S3, or DigitalOcean Spaces.
2. Add to `.env.local`:
   ```
   S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com
   S3_BUCKET=krossover-studio
   S3_ACCESS_KEY=...
   S3_SECRET_KEY=...
   S3_PUBLIC_URL=https://cdn.kross-over.net   # public read URL
   ```
Without this it falls back to a local `/public/uploads` folder (fine for dev, not for production).

---

## Stage 3 — Admin security (required before anyone else can reach the admin)

```
ADMIN_API_KEY=<a long random string>
```
Template + pricing writes (`PUT /api/products/:id`) now require `Authorization: Bearer <key>`. Until set, the admin is open (dev only).

---

## Stage 4 — AI mockup (optional, high impact)

Live product mockup before add-to-cart. Pick one provider:
```
MOCKUP_PROVIDER=gemini        # Nano Banana / Gemini 2.5 Flash Image
GEMINI_API_KEY=...
```
(or `openai` + `OPENAI_API_KEY`, or `fal` + `FAL_KEY`.) Without a key, the editor falls back to copying the prompt.

---

## Stage 5 — Image processing (optional, recommended)

```
BG_PROVIDER=removebg          # best-quality background removal
REMOVEBG_API_KEY=...
```
Without it, the built-in white-key removal handles clean studio shots. Vectorize (potrace) and screening work out of the box.

---

## Stage 6 — Upload moderation (recommended before public launch)

Protects you from NSFW / copyrighted logo uploads.
```
MODERATION_URL=https://api.sightengine.com/1.0/check.json   # or Rekognition / Hive
MODERATION_KEY=...
```
Without it, size/type checks still run; content moderation is skipped.

---

## Stage 7 — Production print output (required for the factory)

- Install **Ghostscript** (`gs`) on the host for true CMYK, then set `ENABLE_CMYK=1`. Without it, print PDFs are RGB (fine for digital proofs).
- Separations (one film per spot colour) and bleed + crop marks work with no extra setup.

---

## Stage 8 — Deploy

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Krossover Studio"
   git branch -M main
   git remote add origin https://github.com/<you>/krossover-studio.git
   git push -u origin main
   ```
2. Import the repo at **vercel.com** (auto-detects Next.js). Add every `.env.local` value in the Vercel dashboard.
3. Deploy. (Note: `sharp`/Ghostscript are native — Vercel handles `sharp`; for heavy CMYK/rendering a small Node server or a worker is more reliable than serverless.)

---

## Stage 9 — Connect to Krossover (the integration)

See `INTEGRATION-SPEC` (the Word doc). Your Krossover developer builds three endpoints:
- `GET /api/products` — list products for the Studio admin
- `GET /api/products/{sku}` — one product's base price for the editor
- `POST /api/cart/add` — accept a custom cart line

Then embed the editor on the product page via `public/embed.js` with the SKU, and wire its `ko:add-to-cart` message into your cart.

---

## Minimum to launch

Stages **1, 2, 3, 7** are required. **4, 5, 6** make it better and safer. **8, 9** put it on your site. Everything runs on fallbacks until each key is added, so you can go live incrementally.

## What still needs your QA

Test each real product end-to-end: correct print sizes, colour-limit enforcement on real logos, separation output the factory can actually burn, and price totals matching your commercial sheet. The code is built; the numbers and the print files need your sign-off before customers see them.
