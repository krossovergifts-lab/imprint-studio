"use client";
// Imprint Studio — app landing page. Drop in at src/app/page.tsx.
// Self-contained: pulls fonts from Google Fonts, all styles inline, links to the public/ tools.
const HTML = String.raw`
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap">
<style>
/* Light-committed "builder tool" landing — white canvas, dark-blue ink, blue action, one lime highlight. */
:root{
  --bg:#f5f8fd; --surface:#ffffff; --ink:#0d1f3c; --ink-2:#3a506f; --muted:#7589a3;
  --line:#e2e9f3; --line-2:#cfdaea;
  --accent:#2f6fed; --accent-ink:#ffffff; --accent-soft:#e9f0fe;
  --pop:#d8f24e; --pop-ink:#16331f;
  --radius:18px; --radius-sm:11px;
  --disp:"Bricolage Grotesque", "Hanken Grotesk", system-ui, sans-serif;
  --body:"Hanken Grotesk", system-ui, -apple-system, sans-serif;
  --shadow:0 18px 50px -24px rgba(13,31,60,.28);
  --shadow-sm:0 8px 24px -14px rgba(13,31,60,.22);
  color-scheme:light;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--body);font-size:16px;line-height:1.55;-webkit-font-smoothing:antialiased}
h1,h2,h3{font-family:var(--disp);margin:0;line-height:1.05;text-wrap:balance;letter-spacing:-.02em}
p{margin:0}
a{color:inherit;text-decoration:none}
.wrap{max-width:1140px;margin:0 auto;padding-left:max(20px,env(safe-area-inset-left,0px));padding-right:max(20px,env(safe-area-inset-right,0px))}
.eyebrow{font-family:var(--body);font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}

/* nav */
.nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:20;background:rgba(245,248,253,.82);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.nav .wrap{display:flex;align-items:center;gap:18px;padding-block:13px}
.brand{display:flex;align-items:center;gap:11px;font-family:var(--disp);font-weight:700;font-size:18px;letter-spacing:-.01em}
.mark{width:34px;height:34px;border-radius:10px;background:var(--ink);color:#fff;display:grid;place-items:center;flex:none}
.nav .links{display:flex;gap:24px;margin-left:14px;font-weight:600;font-size:14.5px;color:var(--ink-2)}
.nav .links a:hover{color:var(--ink)}
.nav .spacer{margin-left:auto}
.btn{display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:14.5px;padding:10px 18px;border-radius:11px;border:1px solid transparent;cursor:pointer;transition:transform .12s ease, box-shadow .12s ease}
.btn-primary{background:var(--accent);color:var(--accent-ink);box-shadow:0 10px 24px -12px rgba(47,111,237,.75)}
.btn-primary:hover{transform:translateY(-1px)}
.btn-ghost{background:var(--surface);color:var(--ink);border-color:var(--line-2)}
.btn-ghost:hover{border-color:var(--accent);color:var(--accent)}
.nav-hide{display:inline-flex}
@media(max-width:860px){.nav .links{display:none}.nav .spacer{margin-left:auto}}
@media(max-width:560px){.nav-hide{display:none}}

/* hero */
.hero{position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;inset:-20% -10% auto -10%;height:560px;background:
  radial-gradient(60% 70% at 18% 20%, rgba(47,111,237,.14), transparent 70%),
  radial-gradient(50% 60% at 88% 8%, rgba(216,242,78,.22), transparent 72%);
  pointer-events:none}
.hero .wrap{position:relative;display:grid;grid-template-columns:1.05fr .95fr;gap:52px;align-items:center;padding-block:66px 54px}
.tag{display:inline-flex;align-items:center;gap:9px;background:var(--surface);border:1px solid var(--line-2);border-radius:100px;padding:6px 13px 6px 7px;font-size:13px;font-weight:600;color:var(--ink-2);box-shadow:var(--shadow-sm)}
.tag b{background:var(--pop);color:var(--pop-ink);border-radius:100px;padding:2px 9px;font-size:11.5px;letter-spacing:.02em}
h1{font-size:clamp(38px,5.4vw,62px);font-weight:800;margin:20px 0 0}
h1 .hl{position:relative;white-space:nowrap}
h1 .hl::after{content:"";position:absolute;left:-2px;right:-2px;bottom:.06em;height:.34em;background:var(--pop);z-index:-1;border-radius:3px;transform:rotate(-1.2deg)}
.lede{color:var(--ink-2);font-size:clamp(16px,1.9vw,19px);margin-top:20px;max-width:34em}
.cta-row{display:flex;gap:13px;flex-wrap:wrap;margin-top:28px}
.btn-lg{padding:14px 24px;font-size:16px;border-radius:13px}
.trust{display:flex;gap:26px;flex-wrap:wrap;margin-top:34px;padding-top:26px;border-top:1px solid var(--line)}
.trust .n{font-family:var(--disp);font-weight:700;font-size:26px;letter-spacing:-.02em}
.trust .k{font-size:12.5px;color:var(--muted);font-weight:600}

/* hero builder mock */
.mock{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:22px;box-shadow:var(--shadow);padding:16px;animation:floaty 7s ease-in-out infinite}
@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@media(prefers-reduced-motion:reduce){.mock{animation:none}}
.mock .bar{display:flex;align-items:center;gap:7px;padding:4px 4px 12px}
.mock .dot{width:9px;height:9px;border-radius:50%;background:var(--line-2)}
.mock .bar .ttl{margin-left:8px;font-size:12px;font-weight:700;color:var(--muted)}
.mock .stagerow{display:grid;grid-template-columns:44px 1fr 150px;gap:12px}
.rail{display:flex;flex-direction:column;gap:7px}
.rail i{height:34px;border-radius:9px;background:var(--bg);border:1px solid var(--line);display:grid;place-items:center;color:var(--ink-2)}
.rail i.on{background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}
.canvas{position:relative;background:linear-gradient(180deg,#f8fbff,#eef4fc);border:1px solid var(--line);border-radius:12px;min-height:232px;display:grid;place-items:center;overflow:hidden}
.bottle{width:92px;height:196px;border-radius:30px 30px 20px 20px;background:
  linear-gradient(90deg,#d8b78a,#f0d9b2 30%,#e7c79b 60%,#cbac7e);
  border:1px solid #c6a978;position:relative;box-shadow:inset 0 0 0 6px rgba(255,255,255,.18)}
.bottle::before{content:"";position:absolute;top:-16px;left:50%;transform:translateX(-50%);width:54px;height:20px;border-radius:7px;background:#b9c2cc;border:1px solid #9aa6b2}
.boundary{position:absolute;top:66px;left:50%;transform:translateX(-50%);width:66px;height:66px;border:1.6px dashed var(--accent);border-radius:7px;display:grid;place-items:center}
.boundary span{font-family:var(--disp);font-weight:800;font-size:13px;color:var(--accent)}
.pricecard{background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:12px}
.pricecard .lab{font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.sizepills{display:flex;gap:5px;margin:8px 0 12px}
.sizepills b{flex:1;text-align:center;font-size:11px;font-weight:700;padding:5px 0;border-radius:7px;border:1px solid var(--line-2);color:var(--ink-2)}
.sizepills b.on{background:var(--accent);border-color:var(--accent);color:#fff}
.prow{display:flex;justify-content:space-between;font-size:12.5px;padding:3px 0;color:var(--ink-2)}
.prow.tot{border-top:1px dashed var(--line-2);margin-top:6px;padding-top:7px;font-weight:800;color:var(--ink);font-family:var(--disp)}
.chip-float{position:absolute;right:-12px;top:22px;background:var(--ink);color:#fff;font-weight:700;font-size:12.5px;padding:8px 13px;border-radius:11px;box-shadow:var(--shadow);display:flex;align-items:center;gap:7px}
.chip-float i{width:7px;height:7px;border-radius:50%;background:var(--pop)}

@media(max-width:900px){.hero .wrap{grid-template-columns:1fr;gap:38px;padding-block:44px 40px}.mock{max-width:460px}}

/* band base */
section{padding-block:64px}
.band{background:var(--surface);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.sec-head{max-width:640px;margin-bottom:40px}
.sec-head h2{font-size:clamp(27px,3.4vw,38px);font-weight:700;margin-top:12px}
.sec-head p{color:var(--ink-2);margin-top:14px;font-size:17px}

/* steps */
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.step{background:var(--bg);border:1px solid var(--line);border-radius:var(--radius);padding:24px}
.step .no{font-family:var(--disp);font-weight:800;font-size:15px;color:var(--accent);background:var(--accent-soft);width:34px;height:34px;border-radius:9px;display:grid;place-items:center}
.step h3{font-size:19px;margin:16px 0 8px;font-weight:700}
.step p{color:var(--ink-2);font-size:15px}
@media(max-width:800px){.steps{grid-template-columns:1fr}}

/* features */
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.feat{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:22px;transition:transform .14s ease,box-shadow .14s ease}
.feat:hover{transform:translateY(-3px);box-shadow:var(--shadow-sm)}
.feat .ic{width:42px;height:42px;border-radius:11px;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center;margin-bottom:15px}
.feat h3{font-size:17.5px;font-weight:700;margin-bottom:7px}
.feat p{color:var(--ink-2);font-size:14.5px}
@media(max-width:860px){.grid{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.grid{grid-template-columns:1fr}}

/* methods */
.methods{display:flex;flex-wrap:wrap;gap:10px}
.m{display:inline-flex;align-items:center;gap:9px;background:var(--surface);border:1px solid var(--line-2);border-radius:100px;padding:9px 16px;font-weight:600;font-size:14.5px}
.m i{width:8px;height:8px;border-radius:2px;flex:none}

/* CTA band */
.cta{background:var(--ink);border-radius:26px;padding:clamp(34px,5vw,58px);text-align:center;position:relative;overflow:hidden;color:#fff}
.cta::before{content:"";position:absolute;inset:auto -10% -60% -10%;height:340px;background:radial-gradient(50% 100% at 50% 100%,rgba(216,242,78,.3),transparent 70%)}
.cta h2{color:#fff;font-size:clamp(28px,4vw,44px);font-weight:800;position:relative}
.cta p{color:#b9c8e0;margin:16px auto 0;max-width:34em;position:relative;font-size:17px}
.cta .cta-row{justify-content:center;position:relative}
.btn-pop{background:var(--pop);color:var(--pop-ink)}
.btn-pop:hover{transform:translateY(-1px)}
.btn-outline{background:transparent;color:#fff;border-color:rgba(255,255,255,.28)}
.btn-outline:hover{border-color:#fff}

/* footer */
footer{padding-block:34px;color:var(--muted);font-size:13.5px}
footer .wrap{display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:space-between}
footer .brand{font-size:15px;color:var(--ink)}
footer .mark{width:28px;height:28px;border-radius:8px}
</style>

<nav class="nav"><div class="wrap">
  <a class="brand" href="#top"><span class="mark"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6a3 3 0 1 1 6 0c0 1.5-1.2 2.3-1.8 3.2-.4.6-.2 1.3.3 1.6l3.2 1.8c.6.3 1 .9 1 1.6V17H6v-1.8c0-.7.4-1.3 1-1.6l3.2-1.8c.5-.3.7-1 .3-1.6C9.2 8.3 9 7.5 9 6z"/><rect x="5" y="18" width="14" height="3" rx="1"/></svg></span>Imprint&nbsp;Studio</a>
  <div class="links"><a href="#how">How it works</a><a href="#features">Features</a><a href="#methods">Methods</a></div>
  <span class="spacer"></span>
  <a class="btn btn-ghost nav-hide" href="/product-manager.html">Admin</a>
  <a class="btn btn-primary" href="/multi-area-studio.html">Open Studio</a>
</div></nav>

<header class="hero" id="top"><div class="wrap">
  <div class="hero-copy">
    <span class="tag"><b>Embeddable</b> One tool, every product page</span>
    <h1>Let customers <span class="hl">personalize</span> any product — in your store.</h1>
    <p class="lede">Imprint Studio is a headless personalization engine. Your team sets up each product once; customers add text, logos and shapes inside the real print area, pick a printing method and size, and see one live price. Then it drops straight into your cart.</p>
    <div class="cta-row">
      <a class="btn btn-primary btn-lg" href="/multi-area-studio.html">Try the Design Studio →</a>
      <a class="btn btn-ghost btn-lg" href="/product-manager.html">Open Product Manager</a>
    </div>
    <div class="trust">
      <div><div class="n">917</div><div class="k">products ready</div></div>
      <div><div class="n">9+</div><div class="k">printing methods</div></div>
      <div><div class="n">S·M·L</div><div class="k">size-based pricing</div></div>
      <div><div class="n">CMYK</div><div class="k">+ Pantone output</div></div>
    </div>
  </div>

  <div class="mock" aria-hidden="true">
    <div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="ttl">Design Studio — Bamboo Bottle</span></div>
    <div class="stagerow">
      <div class="rail">
        <i class="on"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 6h16M12 6v13M8 19h8"/></svg></i>
        <i><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M4 17l5-5 4 4 3-3 4 4"/></svg></i>
        <i><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8"/></svg></i>
        <i><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg></i>
      </div>
      <div class="canvas">
        <div class="bottle"><div class="boundary"><span>LOGO</span></div></div>
        <div class="chip-float"><i></i>Live price · AED 45.00</div>
      </div>
      <div class="pricecard">
        <div class="lab">Print size</div>
        <div class="sizepills"><b>S</b><b class="on">M</b><b>L</b></div>
        <div class="prow"><span>Product × 1</span><span>35.00</span></div>
        <div class="prow"><span>UV 360 · M</span><span>10.00</span></div>
        <div class="prow tot"><span>Total</span><span>45.00</span></div>
      </div>
    </div>
  </div>
</div></header>

<section class="band" id="how"><div class="wrap">
  <div class="sec-head"><span class="eyebrow">How it works</span><h2>Set up once. Sell personalized forever.</h2><p>Your commerce data stays in your store. Customization data lives in Imprint Studio. They meet on the SKU.</p></div>
  <div class="steps">
    <div class="step"><div class="no">1</div><h3>Admin prepares the product</h3><p>In the Product Manager, pick a product and mark its print area, real dimensions and the printing methods it allows — flat, 360° wrap, or multiple parts.</p></div>
    <div class="step"><div class="no">2</div><h3>Customer designs it</h3><p>On the product page, the shopper adds text, their own logo (background removed) and shapes, picks a method and size, and watches one final price update live.</p></div>
    <div class="step"><div class="no">3</div><h3>It lands in your cart</h3><p>Add to cart hands your store a clean line-up: product + printing lines, a print-ready vector artwork and a spec sheet with fonts, CMYK and Pantone.</p></div>
  </div>
</div></section>

<section id="features"><div class="wrap">
  <div class="sec-head"><span class="eyebrow">Built for real production</span><h2>Everything the print floor actually needs.</h2></div>
  <div class="grid">
    <div class="feat"><div class="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8l-4 4 4 4M17 8l4 4-4 4M14 4l-4 16"/></svg></div><h3>Drop-in embed</h3><p>One script and a div embeds the studio on any product page. Works on Krossover and Shanghai alike — brand-neutral by design.</p></div>
    <div class="feat"><div class="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg></div><h3>Multi-part products</h3><p>Body, lid, base — each section gets its own material, allowed methods and print area. Customers pay only for the sections they print.</p></div>
    <div class="feat"><div class="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg></div><h3>Size-based pricing</h3><p>Every method carries Small, Medium and Big prices. Customers choose a size, the price moves — and they can plan to a budget before they buy.</p></div>
    <div class="feat"><div class="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="12" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="13" r="2.5"/><path d="M12 22a10 10 0 1 1 0-20 6 6 0 0 0 0 12 2 2 0 0 1 0 8z"/></svg></div><h3>CMYK + Pantone</h3><p>A real colour picker with CMYK entry and the closest Pantone shown live — stamped onto every artwork so production matches exactly.</p></div>
    <div class="feat"><div class="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 3-3 3-3-3zM5 9l3 3-3 3-3-3zM19 9l3 3-3 3-3-3zM12 16l3 3-3 3-3-3z"/></svg></div><h3>Vector artwork</h3><p>Text and shapes export as true vectors; logos stay high-res raster. Out comes a print-ready SVG plus a production spec PDF.</p></div>
    <div class="feat"><div class="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18"/></svg></div><h3>Any method, extendable</h3><p>Screen, UV, DTF, sublimation, laser — and you add new ones (embossing, doming, 360 rotary) in the Pricing &amp; Methods tool, no code.</p></div>
  </div>
</div></section>

<section class="band" id="methods"><div class="wrap">
  <div class="sec-head"><span class="eyebrow">Printing methods</span><h2>Nine methods out of the box, more whenever you need them.</h2></div>
  <div class="methods">
    <span class="m"><i style="background:#2f6fed"></i>Screen Printing · 1 / 2 / 3+ colour</span>
    <span class="m"><i style="background:#1a9b73"></i>UV Printing · Flat Bed</span>
    <span class="m"><i style="background:#1a9b73"></i>UV Printing · 360 Rotary</span>
    <span class="m"><i style="background:#8b5cf6"></i>UV DTF Sticker</span>
    <span class="m"><i style="background:#8b5cf6"></i>Heat Transfer DTF</span>
    <span class="m"><i style="background:#e0852b"></i>Sublimation</span>
    <span class="m"><i style="background:#7a6b52"></i>Laser Engraving</span>
    <span class="m"><i style="background:#c3d04a"></i>Embossing · Debossing</span>
    <span class="m"><i style="background:#111111"></i>Epoxy Doming</span>
  </div>
</div></section>

<section><div class="wrap">
  <div class="cta">
    <h2>Ready to make it yours?</h2>
    <p>Open the admin to prepare a product, or jump into the Design Studio and see exactly what your customers will.</p>
    <div class="cta-row">
      <a class="btn btn-pop btn-lg" href="/product-manager.html">Open Product Manager</a>
      <a class="btn btn-outline btn-lg" href="/multi-area-studio.html">Launch Design Studio</a>
    </div>
  </div>
</div></section>

<footer><div class="wrap">
  <a class="brand" href="#top"><span class="mark" style="background:var(--ink);color:#fff;display:inline-grid;place-items:center"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6a3 3 0 1 1 6 0c0 1.5-1.2 2.3-1.8 3.2-.4.6-.2 1.3.3 1.6l3.2 1.8c.6.3 1 .9 1 1.6V17H6v-1.8c0-.7.4-1.3 1-1.6l3.2-1.8c.5-.3.7-1 .3-1.6C9.2 8.3 9 7.5 9 6z"/><rect x="5" y="18" width="14" height="3" rx="1"/></svg></span>Imprint Studio</a>
  <span>Headless product-personalization engine · set up by admin, designed by customers.</span>
</div></footer>
`;
export default function Home() {
  return <main dangerouslySetInnerHTML={{ __html: HTML }} />;
}
