/**
 * Imprint Studio — domain types.
 * Shared by the admin app, the API, the editor payloads, and the render service.
 */

export type ProductType = "flat" | "cylindrical";
export type Material = "cotton" | "ceramic" | "metal" | "wood" | "crystal" | "glass" | "leather" | "paper";

/** How a method lays down color, used by both pricing and the print-effect preview. */
export type ColorModel = "spot" | "full" | "mono";
export type PrintEffect = "ink" | "uv" | "engrave";

/** Admin-editable pricing inputs for a printing method. All amounts in the store currency. */
export interface PricingModel {
  setup?: number;    // one-time per order
  perUnit?: number;  // flat per item
  perColor?: number; // spot methods: × number of colors
  perCm2?: number;   // area methods: × print area in cm²
  minCharge?: number;
}

/** A printing option and its print logic + default pricing. */
export interface PrintingMethod {
  id: string;
  group: string;            // "Screen Printing", "UV Printing", ...
  label: string;            // "1 color", "Full color", ...
  limit: number;            // spot-colour limit; 0 = full colour (unlimited)
  allowsImage: boolean;     // image/logo upload permitted
  colorModel: ColorModel;
  effect: PrintEffect;      // drives the preview render
  pricing: PricingModel;
}

/** Message-card add-on (printed and sent with the gift). */
export interface MessageCard {
  text: string;
  fontId: string;
  color: string;
  widthMm: number;          // A6 landscape default 148 × 105
  heightMm: number;
}

/** Commercials used to build the customer-facing total. */
export interface Commercials {
  productBase: number;      // product price per unit
  qty: number;
  perElement: number;       // charge per design element, per item
  cardPrice: number;        // per unit when a card is added
  vatPct: number;           // e.g. 5 for UAE
  delivery: number;
}

/** Per-product enablement + optional price override for one method (the "admin per-product methods" feature). */
export interface ProductMethodConfig {
  methodId: string;
  enabled: boolean;
  pricingOverride?: Partial<PricingModel>;
}

export interface PrintArea {
  id: string;
  shape: "rect" | "polygon";
  geometry: number[];        // rect: [x,y,w,h] in the view image's px space
  realWidthMm: number;
  realHeightMm: number;
  dpi: number;
  safeMarginMm: number;
  bleedMm?: number;
  constraints?: { allow: Array<"text" | "image" | "shape">; maxColors?: number; minDpiWarn: number };
}

export interface ProductView {
  id: string;
  label: string;            // Front | Back | 360° Wrap
  baseImage: string;        // front image (edit canvas)
  leftImage?: string;       // cylindrical preview
  rightImage?: string;      // cylindrical preview
  diameterMm?: number;      // cylindrical: circumference = π × diameter
  printAreas: PrintArea[];
}

/**
 * A separately-printable PART of a product (the multi-area model).
 * Examples: a crystal award's "Body" + "Base"; a bottle's "Body" (360) + "Lid".
 * Each part has its own material, allowed methods, geometry and pricing — the
 * customer may print any subset, and the order total sums every printed part.
 */
export interface ProductPart {
  id: string;
  label: string;                 // "Bottle body", "Bamboo lid", "Base"
  material: Material;            // drives engrave look + method eligibility
  type: "flat" | "cylindrical";
  images: { front: string; left?: string; right?: string };
  // real dimensions
  realWidthMm?: number;          // flat
  realHeightMm: number;
  diameterMm?: number;           // cylindrical
  dpi: number;
  safeMarginMm: number;
  bandPos?: number;              // cylindrical: where the print band sits (0..1)
  methodIds: string[];           // allowed methods for THIS part
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  type: ProductType;
  material: Material;
  methods: ProductMethodConfig[]; // product-level allowed methods (single-area products)
  parts?: ProductPart[];          // multi-area products: one entry per printable part
  views: ProductView[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DesignElement {
  type: "text" | "image" | "shape";
  x: number; y: number; w: number; h: number; rotation: number;
  textValue?: string; script?: "LTR" | "RTL"; fontId?: string; fontSize?: number; color?: string;
  assetId?: string; imageRef?: string;
  shape?: "rect" | "circle"; fill?: string;
}

export interface PrintSelection {
  methodId: string;
  colors?: number; // spot methods only
}

/** One printed part in a customer's design (multi-area model). */
export interface PartSelection {
  partId: string;
  methodId: string;
  colors?: number;
  elements: number;   // number of design elements placed on this part
}

export interface PriceBreakdown {
  currency: string;
  setup: number;
  unit: number;
  total: number;
}

export interface Design {
  id?: string;
  productId: string;
  print: PrintSelection;
  price: PriceBreakdown;
  perView: { viewId: string; areaId: string; elements: DesignElement[] }[];
  previewDataUrl?: string;
  createdAt?: string;
}
