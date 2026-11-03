import Link from "next/link";

// ADMIN — Product Manager: the live your catalogue with per-product
// customization setup. Hosts public/product-manager.html.
export default function Manager() {
  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Product Manager <span className="pill">admin</span></h1>
        <Link className="btn ghost" href="/">← Home</Link>
      </div>
      <p className="sub">Prepare each product for customization — fetched live from your catalogue, set up once per SKU. Customers never see this.</p>
      <iframe src="/product-manager.html" title="Krossover Product Manager" style={{ minHeight: 820 }} />
    </main>
  );
}
