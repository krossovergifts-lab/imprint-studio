# Imprint Studio

Embeddable product-personalization engine for Krossover Gifts and Shanghai Gifts.
Brand-neutral — one tool, both storefronts, joined to each store by **SKU**.

## What's in here

```
public/
  product-manager.html   Admin: the full catalogue; shows Ready vs Needs-setup; opens each SKU to set up
  part-setup.html        Admin: per-SKU setup — print area(s), real dimensions, allowed methods (multi-part)
  multi-area-studio.html Customer: loads a product by SKU; add text/logo/shapes; live price; add to cart
  editor.html            Legacy single-canvas editor (kept for reference)
  embed.js               One-line product-page embed (iframe + cart hand-off)
INTEGRATION-SPEC.md      Backend contract: product feed, per-SKU setup API, cart payload, VAT rule
```

## How it flows

1. **Admin** opens `product-manager.html`, sees every product (Ready / Needs setup),
   clicks one → `part-setup.html`, marks the print area(s), sets real-world
   dimensions, and picks the allowed printing methods. Saving stores the setup by SKU.
2. **Customer** opens a product page with the Studio embedded. It loads that SKU's
   setup, shows only the artwork tools (text, logo w/ background removal, shapes),
   and prices live: `product × qty + printing (methods/parts/elements) × qty`.
3. **Add to cart** sends a structured payload (product line + printing lines +
   artwork PNGs + ex-VAT subtotal) to the store. **The store applies VAT at checkout.**

## Run it now (offline demo)

Serve `public/` with any static server, e.g.:

```bash
cd public && python3 -m http.server 8080
```

- Admin:    http://localhost:8080/product-manager.html
- Customer: http://localhost:8080/multi-area-studio.html?sku=11594   (default demo: Bamboo Thermos Bottle)

With no backend, the tools use `localStorage`, so the full admin→customer chain
works: set up a product in the Manager, then click **Preview as customer** on its
card to open it in the Studio with your real print area and methods.

## Go live

Follow `INTEGRATION-SPEC.md` — two endpoints (catalogue feed + per-SKU setup) and
one `onAddToCart` handler. Everything front-end is already built to that contract.

## Design & artwork features

- **Elements:** Text, Line, Rectangle/Square (corner-radius → rounded), Circle,
  Triangle (corner-radius → rounded), Heart, uploaded Logo (PNG/JPG, white bg
  removed). Each element adds the per-element charge.
- **Material-aware effects:** screen = spot ink, UV/DTF/sublimation = clean full
  colour, laser/engrave differs by material (bamboo brown, metal steel, glass
  frosted, leather deboss, stone/ceramic etch).
- **Colour:** Photoshop-style picker (hue + saturation/value square) with **CMYK
  fields** (the print colour model) and the **closest Pantone** shown live below —
  on text, shapes and screen-print spot colours.
- **Fonts:** the full **Google Fonts** library (300+ families incl. Arabic),
  searchable, loaded on demand via the Google Fonts API.
- **Pantone + CMYK:** both shown per element and stamped on the final artwork.
- **Final artwork outputs** (from the review screen): **Vector SVG** (text + shapes
  as true vectors, logos embedded) and an **Artwork Production Sheet PDF** listing
  each element's font, size (mm), colour and Pantone per section. Both also ride
  along in the `add_to_cart` payload (`artworkVectorSvg`, `artworkSpec`).

## Notes

- Dimensions are real-world **mm**; the Studio scales artwork proportionally to the
  product and locks aspect ratio.
- Prices are **global** (set once by the admin), not per-product-instance.
- Rename: "Imprint Studio" is a plain text label — search/replace to rebrand if needed.
- The Next.js app pages (if you use the full repo) still carry older "Krossover"
  wordmarks in `src/app/*.tsx` (layout/page/manager/studio); change those strings
  to "Imprint Studio" there — the HTML tools in this package are already neutral.
