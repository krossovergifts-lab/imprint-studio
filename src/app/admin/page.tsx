"use client";
import { useState } from "react";
import Link from "next/link";
import { PRINTING_METHODS } from "@/lib/printing-methods";
import type { PricingModel } from "@/lib/types";

const PLABEL: Record<string, string> = { setup: "Setup", perUnit: "Per item", perColor: "Per color", perCm2: "Per cm²", minCharge: "Min" };

/**
 * Global pricing & methods — set ONCE, applied across all products.
 * Per product, the admin only chooses which of these methods are allowed
 * (in the Product Manager → part setup). Prices live here.
 */
export default function Admin() {
  const [methods, setMethods] = useState(() => PRINTING_METHODS.map((m) => ({ ...m, pricing: { ...m.pricing } as PricingModel })));
  const [vat, setVat] = useState(5);
  const [delivery, setDelivery] = useState(0);
  const [perElement, setPerElement] = useState(2);

  const setPrice = (id: string, key: keyof PricingModel, value: number) =>
    setMethods((ms) => ms.map((m) => (m.id === id ? { ...m, pricing: { ...m.pricing, [key]: value } } : m)));

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Global pricing &amp; methods <span className="pill">admin</span></h1>
        <Link className="btn ghost" href="/">← Home</Link>
      </div>
      <p className="sub">Set the price logic for every printing method once, here. Each product just selects which of these methods it allows — it never sets its own prices.</p>

      <div className="card">
        <h2>Store commercials</h2>
        <div className="row" style={{ gap: 16, flexWrap: "wrap" }}>
          <label>VAT %<br /><input type="number" value={vat} onChange={(e) => setVat(+e.target.value)} style={{ width: 90 }} /></label>
          <label>Delivery (AED)<br /><input type="number" value={delivery} onChange={(e) => setDelivery(+e.target.value)} style={{ width: 90 }} /></label>
          <label>Per element (AED)<br /><input type="number" value={perElement} onChange={(e) => setPerElement(+e.target.value)} style={{ width: 90 }} /></label>
        </div>
        <p className="muted" style={{ marginTop: 10 }}>Product price comes from the Krossover catalogue (B2C) per SKU. These apply to every product.</p>
      </div>

      {methods.map((m) => (
        <div className="card" key={m.id}>
          <h2 style={{ marginBottom: 8 }}>{m.group} · {m.label} <span className="pill">{m.colorModel}{m.limit ? ` ≤${m.limit}` : ""}</span></h2>
          <div className="row" style={{ gap: 14, flexWrap: "wrap" }}>
            {Object.keys(m.pricing).map((k) => (
              <label key={k} className="muted" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {PLABEL[k] || k}
                <input type="number" step="0.01" style={{ width: 100 }} value={(m.pricing as any)[k] ?? 0} onChange={(e) => setPrice(m.id, k as keyof PricingModel, parseFloat(e.target.value) || 0)} />
              </label>
            ))}
          </div>
        </div>
      ))}

      <p className="muted" style={{ marginTop: 16 }}>In the deployed app these save to the database and feed every product&apos;s customization price. New methods are added to <code>printing-methods.ts</code> (or stored in the DB) and appear here automatically.</p>
    </main>
  );
}
