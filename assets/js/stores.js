/* QUOPHY — store locator */

function paintStores(query = "") {
  const q = query.trim().toLowerCase();
  const hits = STORES.filter((s) => `${s.name} ${s.address}`.toLowerCase().includes(q));
  $("[data-stores]").innerHTML = hits
    .map(
      (s) => `
      <article class="store-card reveal">
        <h2 class="store-card__name">${escapeHtml(s.name)}</h2>
        <p class="store-card__meta">${escapeHtml(s.address)}</p>
        <p class="store-card__meta">${escapeHtml(s.hours)}</p>
        <p class="store-card__meta"><a class="link-underline" href="tel:${s.phone.replace(/\s/g, "")}">${escapeHtml(s.phone)}</a></p>
      </article>`
    )
    .join("");
  $("[data-stores-empty]").hidden = hits.length > 0;
  observeReveals();
}

document.addEventListener("DOMContentLoaded", () => {
  paintStores();
  const form = $("[data-store-search]");
  form.addEventListener("submit", (event) => event.preventDefault());
  form.querySelector("input").addEventListener("input", (event) => paintStores(event.target.value));
});
