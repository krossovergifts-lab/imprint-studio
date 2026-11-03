import Link from "next/link";

/**
 * Editor host. The editor itself is the framework-agnostic widget served from
 * /public/editor.html (same engine as the MVP prototype), embedded via iframe so
 * it can also be dropped onto any storefront product page through embed.js.
 */
export default function EditorPage() {
  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Design Studio</h1>
        <Link className="btn ghost" href="/">← Home</Link>
      </div>
      <p className="sub">The embeddable editor. On a storefront this mounts on the product page with the product&apos;s template and allowed methods loaded from the API.</p>
      <iframe src="/editor.html?api=/api" title="Imprint Studio editor" allow="clipboard-write" />
    </main>
  );
}
