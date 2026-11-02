import Link from "next/link";
import { PRINTING_METHODS } from "@/lib/printing-methods";
import catalog from "@/data/catalog.json";

export default function Home() {
  const count = (catalog as unknown[]).length;
  return (
    <main className="container">
      <h1>Krossover Studio</h1>
      <p className="sub">Headless product-personalization engine. Two sides: admin prepares each product; customers only design.</p>

      <h2 style={{ marginTop: 8 }}>Admin — backend</h2>
      <div className="grid">
        <Link className="card" href="/manager" style={{ textDecoration: "none", color: "inherit" }}>
          <h2>Product Manager →</h2>
          <p className="muted">All {count.toLocaleString()} Krossover products, fetched live. Set up each one&apos;s print image, area, allowed methods, and prices.</p>
        </Link>
        <Link className="card" href="/admin" style={{ textDecoration: "none", color: "inherit" }}>
          <h2>Pricing &amp; methods →</h2>
          <p className="muted">Per-product method toggles and editable price calculation.</p>
        </Link>
      </div>

      <h2 style={{ marginTop: 20 }}>Customer — product page</h2>
      <div className="grid">
        <Link className="card" href="/studio" style={{ textDecoration: "none", color: "inherit" }}>
          <h2>Design Studio →</h2>
          <p className="muted">What the customer sees: a product pre-set-up, artwork tools only, one final price. No setup, no re-define area.</p>
        </Link>
        <Link className="card" href="/preview3d" style={{ textDecoration: "none", color: "inherit" }}>
          <h2>3D Preview →</h2>
          <p className="muted">Rotatable product with the artwork mapped onto the body.</p>
        </Link>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2>Printing methods <span className="pill">{PRINTING_METHODS.length}</span></h2>
        <table>
          <thead><tr><th>Method</th><th>Colour model</th><th>Effect</th></tr></thead>
          <tbody>
            {PRINTING_METHODS.map((m) => (
              <tr key={m.id}>
                <td>{m.group} · {m.label}</td>
                <td>{m.colorModel}{m.limit ? ` · ≤${m.limit}` : " · unlimited"}</td>
                <td>{m.effect}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="muted" style={{ marginTop: 16 }}>Setup &amp; launch: see <code>GO-LIVE.md</code>. Connecting to Krossover: see <code>INTEGRATION-SPEC</code>.</p>
    </main>
  );
}
