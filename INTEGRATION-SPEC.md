# Imprint Studio — Integration Spec

For the backend/store developer. This document is everything needed to connect
Imprint Studio to the Krossover and Shanghai Gifts storefronts. The Studio
front-end is already built to this contract — these are the two pieces that
live on your side.

---

## 1. The model (one sentence)

Commerce data (SKU, price, stock, product image) lives in **your store**.
Customization data (print area, allowed methods, part dimensions) lives in the
**Studio**, set up once per SKU by an admin. They are joined by **SKU**. The
customer sees a live price while designing; **VAT is applied by your store at
checkout**, never inside the Studio.

```
  YOUR STORE                         IMPRINT STUDIO
  ┌───────────────┐   catalogue     ┌────────────────────┐
  │ Product feed  │ ───────────────▶│ Product Manager     │  admin sets up
  │ (SKU, price,  │                 │ + Part Setup        │  each SKU once
  │  stock, img)  │                 └─────────┬──────────┘
  └───────────────┘                           │ saves setup by SKU
          ▲                                    ▼
          │                         ┌────────────────────┐
          │  add_to_cart payload    │ Customer Studio     │  loads setup by SKU
          └─────────────────────────│ (embedded iframe)   │  designs, prices live
                                     └────────────────────┘
```

There are exactly **two things to build**: (A) a product feed the Studio reads,
and (B) a handler for the add-to-cart payload the Studio sends.

---

## 2. Piece A — Product feed (so the catalogue auto-fills + auto-refreshes)

The Product Manager needs the live list of products. Expose **one** read endpoint.

### `GET {API}/catalogue`
Returns the current sellable catalogue. Call it on load and poll/refresh for
dynamic daily inventory (Studio re-fetches; 5–15 min cache is fine).

```json
{
  "updated": "2026-11-03T07:00:00Z",
  "products": [
    { "sku": "11604BK", "name": "Insulated Bottle with Bamboo Lid",
      "category": "Drinkware", "subType": "Double wall bottle",
      "price": 40.0, "stock": 8,
      "image": "https://cdn.yourstore.com/p/11604BK.png" }
  ]
}
```

| field | type | notes |
|------|------|------|
| `sku` | string | **the join key**, must be stable and unique |
| `name` | string | shown to admin + customer |
| `category` / `subType` | string | used for method defaults + filtering |
| `price` | number | B2C unit price (ex-VAT), AED |
| `stock` | number | 0 = out of stock |
| `image` | string (URL) | print-ready product photo; used as the design background |

> Today the Manager is seeded from your exported catalogue file. Swap that for
> this endpoint URL and the grid auto-fills and refreshes.

---

## 3. Piece B — Per-SKU customization setup (so each product loads its own tools)

When the admin finishes a product in **Part Setup**, the Studio `PUT`s the setup
to your API (it already makes this call when opened with `?api=`). Store it
keyed by SKU and return it on `GET`.

### `PUT {API}/products/{sku}`  — save admin setup
Body = the setup object (shape below). Persist as-is against the SKU.

### `GET {API}/product/{sku}`  — return setup for the customer Studio
Return the same object. If a SKU has no setup yet, return `404` (the product
page simply won't show the customizer).

### Setup object shape
```json
{
  "sku": "11604BK",
  "name": "Insulated Bottle with Bamboo Lid",
  "multiArea": true,
  "productBase": 40.0,
  "vatPct": 5,
  "delivery": 0,
  "perElement": 2,
  "parts": [
    { "label": "Bottle body", "material": "metal", "type": "cylinder",
      "productH": 200, "dia": 50, "printH": 80, "dpi": 300, "safe": 4,
      "bandPos": 0.55, "methods": ["uv360","uvdtf","screen1","screen2","subl"] },
    { "label": "Bamboo lid", "material": "wood", "type": "flat",
      "realW": 60, "realH": 30, "dpi": 300, "safe": 3,
      "methods": ["laser","screen1","uvflat","uvdtf"] }
  ],
  "prices": {
    "screen1": { "setup": 40, "perUnit": 1.0 },
    "uvflat":  { "perUnit": 2.5, "perCm2": 0.03 },
    "laser":   { "perUnit": 3.0 }
  }
}
```

- `type`: `"cylinder"` (360° wrap — uses `dia` + `printH` + `productH` +
  `bandPos`) or `"flat"` (uses `realW` + `realH`). All dimensions in **mm**.
- `methods`: allowed method IDs for that part (see §5).
- `prices`: **global**, set once by the admin — `setup` (one-time per order),
  `perUnit` (per piece), `perCm2` (per piece, scales with print area).
- `perElement`: added per design element, per piece.

---

## 4. The cart hand-off (what the Studio sends you)

On **Add to cart**, the embedded Studio posts a message to the parent page.
`embed.js` catches it and calls `window.ImprintStudio.onAddToCart(payload)`.

```js
window.ImprintStudio = {
  onAddToCart: function (p) {
    // 1) add p.items as cart lines (product line + one line per printed section)
    // 2) attach p.artwork[] (PNG per section) to the cart item / order
    // 3) let YOUR checkout add VAT on (subtotalExVat) — see p.note
  }
};
```

### Payload
```json
{
  "event": "add_to_cart",
  "sku": "11604BK",
  "name": "Insulated Bottle with Bamboo Lid",
  "currency": "AED",
  "quantity": 100,
  "items": [
    { "type": "product",  "sku": "11604BK", "qty": 100, "unitPrice": 5, "lineTotal": 500 },
    { "type": "printing", "section": "Bottle body", "method": "UV Printing 360 Rotary",
      "elements": 1, "setup": 40, "unitPrice": 10, "qty": 100, "lineTotal": 1040 }
  ],
  "subtotalExVat": 1540,
  "vatPct": 5,
  "vatEstimate": 77,
  "totalInclVatEstimate": 1617,
  "note": "VAT is applied by the store at checkout",
  "artwork": [ { "section": "Bottle body", "png": "data:image/png;base64,..." } ],
  "artworkVectorSvg": "<svg ...>…</svg>",
  "artworkSpec": [
    { "section": "Bottle body", "material": "bamboo", "method": "UV Printing (360 Rotary) Full color",
      "printSizeMm": [157, 120],
      "elements": [
        { "type": "Text",  "detail": "\"Happy Birthday\"", "sub": "Font Poppins Bold · 22.0 mm · #2F6FED · PANTONE 300 C" },
        { "type": "Shape", "detail": "Heart", "sub": "#E24B4A · PANTONE 185 C" },
        { "type": "Image", "detail": "Uploaded logo (raster)", "sub": "Print as supplied · approx 340 DPI at size" }
      ] }
  ]
}
```

- `artwork[]` — raster preview PNG per section (for the cart thumbnail / proof).
- `artworkVectorSvg` — **production artwork as vector**: text and shapes are real
  vector paths, scaled to true mm; uploaded logos are embedded. Send this to the
  printer, not the PNG.
- `artworkSpec[]` — per-element production detail: font + size (mm), fill hex, and
  **closest Pantone** for every text/shape; uploaded images carry their effective
  DPI. The same data prints on the "Artwork Production Sheet" PDF the customer can
  download from the review screen.

**Rule:** add cart lines from `items` and apply VAT on `subtotalExVat` in your
checkout. `vatEstimate` / `totalInclVatEstimate` are for display only — do not
use them as the charged amount. This avoids double-VAT and keeps your tax
records authoritative.

---

## 5. Printing methods (canonical IDs)

| id | name | color | notes |
|----|------|------|------|
| `screen1` | Screen Printing — 1 colour | spot | one ink |
| `screen2` | Screen Printing — 2 colour | spot | two inks |
| `screen3` | Screen Printing — 3+ colour | spot | |
| `uvflat` | UV Printing — Flat Bed | full colour | |
| `uv360` | UV Printing — 360 Rotary | full colour | wraps cylinders |
| `uvdtf` | UV DTF Sticker | full colour | |
| `dtf` | Heat Transfer DTF | full colour | |
| `subl` | Sublimation | full colour | |
| `laser` | Laser Engraving / Marking | mono | |

New methods can be added later: add the ID to the registry + its price, and it
becomes selectable in Part Setup. Screen Printing enforces its colour limit on
uploaded artwork; full-colour methods have no limit.

---

## 5b. Design elements, materials & Pantone

**Elements the customer can add** (each is one chargeable element at `perElement`):
Text, Line, Rectangle (corner-radius → rounded), Square, Circle, Triangle
(corner-radius → rounded), Heart, and an uploaded Logo/photo. New shapes can be
added to the pack later.

**Vector vs raster:** Text and all shapes are kept as **vectors** and export as true
vector in `artworkVectorSvg` (scalable, crisp, spot-colour ready). Only an uploaded
logo/photo stays raster — accept **PNG or JPEG**, and it prints cleanly when it is
**≥300 DPI at the real print size**. The Studio shows the effective DPI and warns
when a logo would print soft.

**Material-aware effects** (how the proof renders per method + material):
screen printing → flat spot ink (colour-limited); UV / DTF / sublimation → clean
full colour; laser/engrave differs by material — **bamboo/wood = burnt brown,
metal = brushed-steel mark, glass/crystal = frosted etch, leather = dark deboss,
stone/ceramic = pale etch**. Material is set per part in Part Setup.

**Colour & fonts:** the colour picker is a Photoshop-style wheel with **CMYK** entry
(print model); text uses the **full Google Fonts library** (300+ families, loaded on
demand from the Google Fonts API). For hosting behind a strict CSP, allow
`fonts.googleapis.com` and `fonts.gstatic.com`.

**Pantone + CMYK:** every colour maps to its closest Pantone (approximate sRGB→PMS)
and its CMYK breakdown; both are shown next to the colour and stamped on the artwork
spec PDF and in `artworkSpec` (e.g. `#2F6FED · C80 M53 Y0 K7 · PANTONE 300 C`).
These are approximations — production must confirm against a physical Pantone book.

## 6. Embedding on a product page

```html
<div id="imprint-studio" data-sku="11604BK"></div>
<script src="https://studio.yourdomain.com/embed.js"
        data-base="https://studio.yourdomain.com"
        data-api="https://studio.yourdomain.com/api"></script>
<script>
  window.ImprintStudio = { onAddToCart: function (p) { /* your cart */ } };
</script>
```

Same snippet works on Krossover and Shanghai — only `data-sku` changes per page.
The tool is brand-neutral, so it sits on either storefront unchanged.

---

## 7. Hosting

Static files (`multi-area-studio.html`, `product-manager.html`,
`part-setup.html`, `editor.html`, `embed.js`) serve from any static host or
CDN. Routes expected by the tools: `/manager`, `/part-setup.html`,
`/multi-area-studio.html`, `/embed.js`. The only dynamic part is your API
(§2–§4). Until the API exists, the tools fall back to `localStorage`, so the
full admin→customer flow is already demoable offline.

---

## 8. Build checklist

- [ ] `GET /api/catalogue` returns live products (§2)
- [ ] `PUT /api/products/{sku}` stores admin setup (§3)
- [ ] `GET /api/product/{sku}` returns setup, 404 if none (§3)
- [ ] Point the Product Manager's feed at `/api/catalogue`
- [ ] Add the embed snippet to the product-page template (§6)
- [ ] Implement `onAddToCart`: add lines, attach artwork, **apply VAT in checkout** (§4)
