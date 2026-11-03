import Link from "next/link";

// CUSTOMER — multi-area Design Studio: a product with several printable parts
// (e.g. bottle body + bamboo lid). Each part has its own material, allowed methods
// and price; the customer designs any subset and the total sums every printed part.
export default function StudioMulti() {
  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Design Studio — multi-area <span className="pill">customer</span></h1>
        <Link className="btn ghost" href="/">← Home</Link>
      </div>
      <p className="sub">For products with more than one printable part. Design any part you like — you only pay for the parts you print, each at its own method and price.</p>
      <iframe src="/multi-area-studio.html" title="Krossover multi-area studio" style={{ minHeight: 780 }} />
    </main>
  );
}
