/* Imprint Studio — product-page embed
 * Drop one <script> + one <div> on any product page. The Studio loads the
 * product by SKU, lets the customer design, and hands a cart payload back.
 *
 *   <div id="imprint-studio" data-sku="11604BK"></div>
 *   <script src="https://studio.yourdomain.com/embed.js"
 *           data-base="https://studio.yourdomain.com"
 *           data-api="https://studio.yourdomain.com/api"></script>
 *
 * When the customer clicks "Add to cart", this script receives the design +
 * pricing and calls window.ImprintStudio.onAddToCart(payload). Wire that to
 * your cart. VAT is NOT in the payload total — your checkout applies it.
 */
(function () {
  var s = document.currentScript;
  var BASE = (s && s.getAttribute("data-base")) || "";
  var API  = (s && s.getAttribute("data-api"))  || (BASE ? BASE + "/api" : "/api");
  var MOUNT = (s && s.getAttribute("data-mount")) || "imprint-studio";

  function mount() {
    var host = document.getElementById(MOUNT);
    if (!host) return;
    var sku = host.getAttribute("data-sku");
    if (!sku) { console.warn("[Imprint] #" + MOUNT + " has no data-sku"); return; }

    var iframe = document.createElement("iframe");
    iframe.src = BASE + "/multi-area-studio.html?api=" + encodeURIComponent(API) +
                 "&sku=" + encodeURIComponent(sku);
    iframe.style.cssText = "width:100%;min-height:720px;border:0;border-radius:12px;";
    iframe.setAttribute("allow", "clipboard-write");
    iframe.setAttribute("title", "Personalize this product");
    host.innerHTML = "";
    host.appendChild(iframe);

    window.addEventListener("message", function (e) {
      var d = e.data || {};
      if (d.type !== "IMPRINT_ADD_TO_CART") return;
      var p = d.payload || {};
      if (window.ImprintStudio && typeof window.ImprintStudio.onAddToCart === "function") {
        window.ImprintStudio.onAddToCart(p);     // <-- your cart integration
      } else {
        console.log("[Imprint] add_to_cart (no handler set):", p);
      }
    });
  }

  window.ImprintStudio = window.ImprintStudio || {};
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
