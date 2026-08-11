/* QUOPHY — home page */

document.addEventListener("DOMContentLoaded", () => {
  const rail = document.querySelector('[data-rail="new"]');
  if (rail) {
    const newIn = PRODUCTS.filter((p) => p.badge).concat(PRODUCTS.filter((p) => !p.badge)).slice(0, 8);
    rail.innerHTML = newIn.map((p, i) => productCard(p, { eager: i < 2 })).join("");

    document.querySelectorAll('[data-rail-nav="new"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const step = rail.clientWidth * 0.8;
        rail.scrollBy({ left: btn.dataset.dir === "next" ? step : -step, behavior: "smooth" });
      });
    });
  }

  const categories = document.querySelector("[data-categories]");
  if (categories) {
    const cover = {
      handbags: "assets/img/products/aurelia-shoulder-bag.jpg",
      "ready-to-wear": "assets/img/products/marabel-wool-coat.jpg",
      shoes: "assets/img/products/odalis-loafer.jpg",
      accessories: "assets/img/products/silk-twill-scarf.jpg",
    };
    categories.innerHTML = CATEGORIES.map(
      (c) => `
      <a class="tile reveal" href="collections.html?category=${c.slug}">
        <img src="${cover[c.slug]}" alt="${escapeHtml(c.label)}" loading="lazy" width="600" height="750">
        <span class="tile__caption">
          <span class="tile__title">${escapeHtml(c.label)}</span>
          <span class="link-underline">Shop now</span>
        </span>
      </a>`
    ).join("");
  }

  const services = document.querySelector("[data-services]");
  if (services) {
    services.innerHTML = SERVICES.map(
      (s) => `
      <article class="service-card reveal">
        <img src="${s.image}" alt="${escapeHtml(s.title)}" loading="lazy" width="800" height="600">
        <h3>${escapeHtml(s.title)}</h3>
        <p>${escapeHtml(s.text)}</p>
        <a class="link-underline" href="services.html">Discover more</a>
      </article>`
    ).join("");
  }

  observeReveals();
});
