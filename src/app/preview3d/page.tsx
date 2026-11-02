import Link from "next/link";

// Hosts the three.js 3D product preview (public/viewer3d.html). In the storefront
// the editor passes the wrap texture to it; here it runs standalone with samples.
export default function Preview3D() {
  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>3D Preview</h1>
        <Link className="btn ghost" href="/">← Home</Link>
      </div>
      <p className="sub">Rotatable product with the wrap artwork mapped onto the body. Drop per-product GLB models in <code>public/models/</code> and the viewer maps the same texture onto them.</p>
      <iframe src="/viewer3d.html" title="Krossover 3D preview" style={{ minHeight: 640 }} />
    </main>
  );
}
