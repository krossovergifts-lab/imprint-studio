"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { PRINTING_METHODS, methodById } from "@/lib/printing-methods";
import { SEED_PRODUCTS } from "@/lib/seed-products";
import { areaCm2, priceForProductMethod } from "@/lib/pricing";
import type { Product, PricingModel } from "@/lib/types";

const PLABEL: Record<string, string> = { setup: "Setup", perUnit: "Per item", perColor: "Per color", perCm2: "Per cm²", minCharge: "Min" };

/**
 * Studio Manager — per-product method config + editable printing price calculation.
 * Edits write to each product's ProductMethodConfig.pricingOverride and recompute live.
 * In production, PUT /api/products/:id persists this.
 */
export default function Admin() {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [pid, setPid] = useState(products[0].id);
  const [qty, setQty] = useState(100);
  const [colors, setColors] = useState(1);

  const product = products.find((p) => p.id === pid)!;
  const area = product.views[0].printAreas[0];
  const cm2 = areaCm2(area.realWidthMm, area.realHeightMm);

  const toggle = (methodId: string) =>
    setProducts((ps) => ps.map((p) => (p.id !== pid ? p : { ...p, methods: p.methods.map((m) => (m.methodId === methodId ? { ...m, enabled: !m.enabled } : m)) })));

  const setOverride = (methodId: string, key: keyof PricingModel, value: number) =>
    setProducts((ps) =>
      ps.map((p) =>
        p.id !== pid ? p : { ...p, methods: p.methods.map((m) => (m.methodId === methodId ? { ...m, pricingOverride: { ...(m.pricingOverride || {}), [key]: value } } : m)) }
      )
    );

  const rows = useMemo(
    () =>
      product.methods.map((cfg) => {
        const method = methodById(cfg.methodId)!;
        const eff: PricingModel = { ...method.pricing, ...(cfg.pricingOverride || {}) };
        const price = priceForProductMethod(method, cfg, { colors, areaCm2: cm2, qty });
        return { method, cfg, eff, price };
      }),
    [product, colors, qty, cm2]
  );

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Studio Manager</h1>
        <Link className="btn ghost" href="/">← Home</Link>
      </div>
      <p className="sub">Choose which printing methods each product allows, edit the price calculation per method, and preview the live customization price.</p>

      <div className="card">
        <div className="row">
          <label>Product&nbsp;
            <select value={pid} onChange={(e) => setPid(e.target.value)}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <span className="muted">{product.type} · {product.material} · print area {area.realWidthMm}×{area.realHeightMm}mm ({cm2.toFixed(0)} cm²)</span>
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <label>Qty <input type="number" value={qty} min={1} style={{ width: 90 }} onChange={(e) => setQty(Math.max(1, +e.target.value))} /></label>
          <label>Screen colors <input type="number" value={colors} min={1} max={3} style={{ width: 70 }} onChange={(e) => setColors(Math.min(3, Math.max(1, +e.target.value)))} /></label>
        </div>
      </div>

      {rows.map(({ method, cfg, eff, price }) => (
        <div className="card" key={method.id} style={{ opacity: cfg.enabled ? 1 : 0.55 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <label className="chk"><input type="checkbox" checked={cfg.enabled} onChange={() => toggle(method.id)} /> <b>{method.group} · {method.label}</b></label>
            <span className="price">Total: {price.currency} {price.total.toFixed(2)}</span>
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            {Object.keys(eff).map((k) => (
              <label key={k} className="muted" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {PLABEL[k] || k}
                <input type="number" step="0.01" style={{ width: 90 }} value={(eff as any)[k] ?? 0} onChange={(e) => setOverride(method.id, k as keyof PricingModel, parseFloat(e.target.value) || 0)} />
              </label>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 8 }}>Setup {price.setup.toFixed(2)} + unit {price.unit.toFixed(2)} × {qty}. Spot methods add per-color; area methods add per-cm².</p>
        </div>
      ))}
    </main>
  );
}
