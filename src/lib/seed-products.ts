/**
 * Seed products — stand-in for your inventory-backed product templates.
 * Replace with real records from krossover-api. Each shows the per-product
 * "available methods" feature: products only expose the methods they can run.
 */

import type { Product } from "./types";

export const SEED_PRODUCTS: Product[] = [
  {
    id: "mug-11oz",
    sku: "KO-MUG-403",
    name: "Ceramic Mug 11oz",
    type: "cylindrical",
    material: "ceramic",
    methods: [
      { methodId: "uv", enabled: true },
      { methodId: "uvdtf", enabled: true },
      { methodId: "screen1", enabled: true },
      { methodId: "screen2", enabled: true },
      { methodId: "screenfull", enabled: true },
      { methodId: "engrave", enabled: false }, // can't engrave glazed ceramic
    ],
    views: [
      {
        id: "wrap",
        label: "360° Wrap",
        baseImage: "/products/mug-front.png",
        leftImage: "/products/mug-left.png",
        rightImage: "/products/mug-right.png",
        diameterMm: 82,
        printAreas: [
          { id: "wrap-area", shape: "rect", geometry: [0, 0, 1000, 450], realWidthMm: 258, realHeightMm: 90, dpi: 300, safeMarginMm: 4 },
        ],
      },
    ],
  },
  {
    id: "crystal-block",
    sku: "KO-CRY-512",
    name: "Crystal Award Block",
    type: "flat",
    material: "crystal",
    methods: [
      { methodId: "engrave", enabled: true },  // frosted glass engrave
      { methodId: "uv", enabled: true },
      { methodId: "uvdtf", enabled: true },
      { methodId: "screen1", enabled: true },
      { methodId: "screen2", enabled: true },
      { methodId: "screenfull", enabled: true },
    ],
    views: [
      {
        id: "front",
        label: "Front",
        baseImage: "/products/crystal-front.png",
        printAreas: [
          { id: "front-area", shape: "rect", geometry: [0, 0, 600, 800], realWidthMm: 70, realHeightMm: 95, dpi: 300, safeMarginMm: 5 },
        ],
      },
    ],
  },
  {
    id: "wood-coaster",
    sku: "KO-WUD-221",
    name: "Wooden Coaster",
    type: "flat",
    material: "wood",
    methods: [
      { methodId: "engrave", enabled: true },  // burn brown
      { methodId: "uv", enabled: true },
    ],
    views: [
      {
        id: "front",
        label: "Front",
        baseImage: "/products/coaster-front.png",
        printAreas: [
          { id: "front-area", shape: "rect", geometry: [0, 0, 700, 700], realWidthMm: 90, realHeightMm: 90, dpi: 300, safeMarginMm: 4 },
        ],
      },
    ],
  },
];

export const getProduct = (id: string) => SEED_PRODUCTS.find((p) => p.id === id);
