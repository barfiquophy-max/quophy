/* QUOPHY — product detail page: gallery, size selection, add to bag */

function renderPdp(product) {
  const related = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  const siblings = PRODUCTS.filter((p) => p.category === product.category).slice(0, 4);

  return `
    <section class="pdp">
      <div class="gallery">
        <div class="gallery__track" data-gallery tabindex="0" aria-label="${escapeHtml(product.name)} images">
          ${product.images
            .map(
              (src, i) =>
                `<img src="${src}" alt="${escapeHtml(product.name)} — image ${i + 1} of ${product.images.length}" ${
                  i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'
                } width="1000" height="1250">`
            )
            .join("")}
        </div>
        <button class="gallery__nav" data-gallery-nav data-dir="prev" aria-label="Previous image">
          <svg viewBox="0 0 24 24" aria-hidden="true" style="transform: rotate(180deg)"><path d="m9 5 7 7-7 7"/></svg>
        </button>
        <button class="gallery__nav" data-gallery-nav data-dir="next" aria-label="Next image">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>
        </button>
        <div class="gallery__dots" data-gallery-dots>
          ${product.images.map((_, i) => `<span class="gallery__dot${i === 0 ? " is-active" : ""}"></span>`).join("")}
        </div>
      </div>

      <div class="pdp__panel">
        <nav aria-label="Breadcrumb">
          <ol class="breadcrumbs">
            <li><a href="index.html">Home</a></li>
            <li><a href="collections.html?category=${product.category}">${escapeHtml(
    CATEGORIES.find((c) => c.slug === product.category).label
  )}</a></li>
            <li>${escapeHtml(product.name)}</li>
          </ol>
        </nav>

        <div class="stack" style="--sp-4: 10px">
          <h1 class="pdp__title">${escapeHtml(product.name)}</h1>
          <p class="pdp__price">${money(product.price)}</p>
          <p class="pdp__style">Style ${escapeHtml(product.style)}</p>
        </div>

        <div>
          <p class="field-label"><span>Colour</span><span>${escapeHtml(product.color)}</span></p>
          <div class="swatches">
            ${siblings
              .map(
                (s) =>
                  `<a class="swatch${s.id === product.id ? " is-active" : ""}" href="${productUrl(s.id)}"
                     style="background:${s.colorHex}" aria-label="${escapeHtml(s.color)} — ${escapeHtml(s.name)}"
                     ${s.id === product.id ? 'aria-current="true"' : ""}></a>`
              )
              .join("")}
          </div>
        </div>

        ${
          product.sizes.length
            ? `<div>
                 <p class="field-label"><span>Size</span><a class="link-underline" href="services.html#sizing">Size guide</a></p>
                 <div class="sizes" role="group" aria-label="Select a size">
                   ${product.sizes.map((s) => `<button class="size" type="button" data-size="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join("")}
                 </div>
                 <p class="field-error" data-size-error hidden>Please select a size.</p>
               </div>`
            : ""
        }

        <div class="stack" style="--sp-4: 10px">
          <button class="btn btn--full" data-add-to-bag data-id="${product.id}">${ICONS.bag} Add to bag</button>
          <button class="btn btn--ghost btn--full" data-wish="${product.id}" aria-pressed="${Wishlist.has(product.id)}">
            Add to wishlist
          </button>
        </div>

        <ul class="services-note">
          <li>${ICONS.truck}<span>Complimentary express shipping and returns.</span></li>
          <li>${ICONS.gift}<span>Signature packaging, with a hand-tied ribbon.</span></li>
          <li>${ICONS.refresh}<span>Collect in store within two hours.</span></li>
        </ul>

        <p class="pdp__desc">${escapeHtml(product.description)}</p>

        <div class="accordion">
          <div class="accordion__item">
            <button class="accordion__btn" aria-expanded="false" aria-controls="acc-details">Product details ${ICONS.plus}</button>
            <div class="accordion__panel" id="acc-details">
              <ul class="accordion__inner stack" style="--sp-4: 6px">${product.details.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>
            </div>
          </div>
          <div class="accordion__item">
            <button class="accordion__btn" aria-expanded="false" aria-controls="acc-materials">Materials &amp; care ${ICONS.plus}</button>
            <div class="accordion__panel" id="acc-materials">
              <ul class="accordion__inner stack" style="--sp-4: 6px">
                ${product.materials.map((m) => `<li>${escapeHtml(m)}</li>`).join("")}
                <li>Store in the provided dust bag, away from direct light.</li>
              </ul>
            </div>
          </div>
          <div class="accordion__item">
            <button class="accordion__btn" aria-expanded="false" aria-controls="acc-shipping">Shipping &amp; returns ${ICONS.plus}</button>
            <div class="accordion__panel" id="acc-shipping">
              <div class="accordion__inner">
                <p>Complimentary express delivery in 2–4 business days, and free returns within 30 days of receipt.
                Orders placed before 14:00 local time are dispatched the same day.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    ${
      related.length
        ? `<section class="section">
             <div class="wrap">
               <h2 class="section-title">You may also like</h2>
               <div class="grid grid--4" style="margin-top: var(--sp-6)">${related.map((p) => productCard(p)).join("")}</div>
             </div>
           </section>`
        : ""
    }`;
}

function initGallery() {
  const track = $("[data-gallery]");
  if (!track) return;
  const dots = $$("[data-gallery-dots] .gallery__dot");

  $$("[data-gallery-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      track.scrollBy({ left: btn.dataset.dir === "next" ? track.clientWidth : -track.clientWidth, behavior: "smooth" });
    });
  });

  track.addEventListener(
    "scroll",
    () => {
      const index = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    },
    { passive: true }
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const id = new URLSearchParams(location.search).get("id");
  const product = getProduct(id) || PRODUCTS[0];
  const main = $("[data-pdp]");

  if (!getProduct(id) && id) {
    $("[data-pdp-missing]").hidden = false;
    return;
  }

  main.innerHTML = renderPdp(product);
  document.title = `${product.name} | QUOPHY`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", product.description.slice(0, 155));

  initGallery();
  observeReveals();

  let selectedSize = product.sizes.length ? null : "";

  main.addEventListener("click", (event) => {
    const size = event.target.closest("[data-size]");
    if (size) {
      selectedSize = size.dataset.size;
      $$("[data-size]").forEach((el) => el.classList.toggle("is-active", el === size));
      $("[data-size-error]").hidden = true;
      return;
    }

    const accordion = event.target.closest(".accordion__btn");
    if (accordion) {
      const panel = document.getElementById(accordion.getAttribute("aria-controls"));
      const open = accordion.getAttribute("aria-expanded") === "true";
      accordion.setAttribute("aria-expanded", String(!open));
      panel.classList.toggle("is-open", !open);
      return;
    }

    const add = event.target.closest("[data-add-to-bag]");
    if (add) {
      if (product.sizes.length && !selectedSize) {
        $("[data-size-error]").hidden = false;
        $(".sizes").scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      Bag.add(product.id, selectedSize, 1);
      toast("Added to your bag");
      Overlay.open("bag", $('[data-open="bag"]'));
    }
  });
});
