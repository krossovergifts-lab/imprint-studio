import Link from "next/link";

// CUSTOMER — the one Design Studio. It adapts to the product's saved setup:
// flat single-area, 360 single-area, or multiple printable parts — showing only
// the tools and methods the admin assigned to that product.
export default function Studio() {
  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Design Studio <span className="pill">customer</span></h1>
        <Link className="btn ghost" href="/">← Home</Link>
      </div>
      <p className="sub">What the customer sees on a product page. It loads the product&apos;s assigned setup — flat, 360°, or multiple parts — artwork tools only, with realtime quantity and one final price.</p>
      <iframe src="/multi-area-studio.html?api=/api" title="Krossover Design Studio" style={{ minHeight: 780 }} />
    </main>
  );
}
