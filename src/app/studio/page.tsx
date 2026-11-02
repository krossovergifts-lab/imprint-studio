import Link from "next/link";

// CUSTOMER — Design Studio: a product loads pre-set-up (image, fixed print area,
// allowed methods, prices). The customer only adds artwork. Hosts public/design-studio.html.
export default function Studio() {
  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Design Studio <span className="pill">customer</span></h1>
        <Link className="btn ghost" href="/">← Home</Link>
      </div>
      <p className="sub">What the customer sees on a product page. The product is already set up — they only add text, their logo, and shapes, then see one final price.</p>
      <iframe src="/design-studio.html?api=/api" title="Krossover Design Studio" style={{ minHeight: 760 }} />
    </main>
  );
}
