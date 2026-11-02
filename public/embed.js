/**
 * Krossover Studio — product-page embed loader
 *
 * Drop this on any product page across any Krossover site. It mounts the Design
 * Studio editor for one product and hands the saved design back to your cart.
 * The editor itself is a self-contained widget (iframe or web component) hosted
 * once; this loader just wires it to the page's product and cart.
 *
 * Usage on a product page:
 *   <div id="ko-studio" data-product-id="SKU123"></div>
 *   <script src="https://studio.kross-over.net/embed.js"></script>
 *   <script>
 *     KrossoverStudio.mount('#ko-studio', {
 *       productId: document.querySelector('#ko-studio').dataset.productId,
 *       apiBase: 'https://api.kross-over.net/studio/v1',
 *       locale: 'en',            // or 'ar' for an Arabic/RTL UI
 *       onAddToCart: (payload) => myCart.addCustomLine(payload)
 *     });
 *   </script>
 */
(function (w) {
  var EDITOR_URL = "https://studio.kross-over.net/editor"; // hosted editor widget

  function mount(selector, opts) {
    var host = typeof selector === "string" ? document.querySelector(selector) : selector;
    if (!host) throw new Error("KrossoverStudio: mount target not found");

    var qs = new URLSearchParams({
      productId: opts.productId,
      apiBase: opts.apiBase,
      locale: opts.locale || "en"
    });

    var frame = document.createElement("iframe");
    frame.src = EDITOR_URL + "?" + qs.toString();
    frame.style.cssText = "width:100%;border:0;border-radius:14px;min-height:640px";
    frame.allow = "clipboard-write";
    host.appendChild(frame);

    // The editor posts messages up to the page. Verify origin in production.
    function onMsg(e) {
      if (e.source !== frame.contentWindow) return;
      var m = e.data || {};
      if (m.type === "ko:add-to-cart" && opts.onAddToCart) opts.onAddToCart(m.payload);
      if (m.type === "ko:resize" && m.height) frame.style.height = m.height + "px";
      if (m.type === "ko:price" && opts.onPrice) opts.onPrice(m.price);
    }
    w.addEventListener("message", onMsg);

    return {
      destroy: function () {
        w.removeEventListener("message", onMsg);
        frame.remove();
      }
    };
  }

  w.KrossoverStudio = { mount: mount };
})(window);
