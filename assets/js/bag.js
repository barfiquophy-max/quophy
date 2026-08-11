/* QUOPHY — shopping bag page */

const TAX_RATE = 0.08;

function bagLine(line) {
  const product = getProduct(line.id);
  return `
    <article class="bag-line">
      <a href="${productUrl(product.id)}"><img src="${product.images[0]}" alt="${escapeHtml(product.name)}" loading="lazy"></a>
      <div class="bag-line__body">
        <h2 class="bag-line__name"><a href="${productUrl(product.id)}">${escapeHtml(product.name)}</a></h2>
        <p class="bag-line__meta">${escapeHtml(product.color)}${line.size ? ` · Size ${escapeHtml(line.size)}` : ""}</p>
        <p class="bag-line__meta">Style ${escapeHtml(product.style)}</p>
        <div class="bag-line__actions">
          <div class="qty">
            <button type="button" data-qty="down" data-id="${product.id}" data-size="${escapeHtml(line.size)}" aria-label="Decrease quantity">−</button>
            <output aria-label="Quantity">${line.qty}</output>
            <button type="button" data-qty="up" data-id="${product.id}" data-size="${escapeHtml(line.size)}" aria-label="Increase quantity">+</button>
          </div>
          <button class="mini-bag__remove" data-mini-remove data-id="${product.id}" data-size="${escapeHtml(line.size)}">Remove</button>
        </div>
      </div>
      <p class="bag-line__price">${money(product.price * line.qty)}</p>
    </article>`;
}

function paintBagPage() {
  const lines = Bag.read();
  const wrap = $("[data-bag-lines]");
  const summary = $("[data-bag-summary]");

  wrap.innerHTML = lines.map(bagLine).join("");
  $("[data-bag-empty]").hidden = lines.length > 0;
  summary.hidden = lines.length === 0;

  if (!lines.length) return;
  const subtotal = Bag.subtotal();
  const tax = Math.round(subtotal * TAX_RATE);
  $("[data-bag-subtotal]").textContent = money(subtotal);
  $("[data-bag-tax]").textContent = money(tax);
  $("[data-bag-total]").textContent = money(subtotal + tax);
}

document.addEventListener("DOMContentLoaded", () => {
  paintBagPage();
  document.addEventListener("bag:change", paintBagPage);

  document.addEventListener("click", (event) => {
    const qty = event.target.closest("[data-qty]");
    if (qty) {
      const line = Bag.read().find((l) => l.id === qty.dataset.id && (l.size || "") === qty.dataset.size);
      if (!line) return;
      Bag.setQty(line.id, line.size, line.qty + (qty.dataset.qty === "up" ? 1 : -1));
      return;
    }
    if (event.target.closest("[data-checkout]")) {
      toast("Checkout is not connected in this build");
    }
  });
});
