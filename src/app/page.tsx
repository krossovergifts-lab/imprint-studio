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
          <h2>Global pricing &amp; methods →</h2>
          <p className="muted">Set each printing method&apos;s price once. Products just select which methods they allow.</p>
        </Link>
      </div>

      <h2 style={{ marginTop: 20 }}>Customer — product page</h2>
      <div className="grid">
        <Link className="card" href="/studio" style={{ textDecoration: "none", color: "inherit" }}>
          <h2>Design Studio →</h2>
          <p className="muted">One studio that adapts to each product&apos;s setup — flat, 360°, or multiple parts. Artwork tools only, realtime quantity, one final price.</p>
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
