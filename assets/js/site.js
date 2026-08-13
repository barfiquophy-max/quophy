/* =========================================================
   QUOPHY — shared shell
   Header, menu, search, mini bag, footer, cart state, helpers
   ========================================================= */

/* ---------- helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: BRAND.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const escapeHtml = (str) =>
  String(str).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

const getProduct = (id) => PRODUCTS.find((p) => p.id === id);

const productUrl = (id) => `product.html?id=${encodeURIComponent(id)}`;

const ICONS = {
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z"/></svg>',
  truck: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>',
  gift: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13"/><path d="M12 7S10 3 8 4.4 9.5 7 12 7s4-1.2 2-2.6S12 7 12 7Z"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.4"/><circle cx="17" cy="7" r="0.8"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h2V5h-2a3 3 0 0 0-3 3v2H9v3h2v6h3v-6h2l1-3h-3V9a1 1 0 0 1 1-1Z"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="3"/><path d="m11 10 4 2-4 2z"/></svg>',
};

/* ---------- persisted state sanitising ---------- */
const MAX_QTY = 99;

const cleanText = (value) => (typeof value === "string" ? value.slice(0, 100) : "");

const cleanQty = (value) => {
  const qty = Math.floor(Number(value));
  if (!Number.isFinite(qty) || qty < 1) return 1;
  return Math.min(qty, MAX_QTY);
};

/* ---------- cart ---------- */
const Bag = {
  key: "quophy.bag",
  // Stored state can be tampered with (devtools, a shared browser, another
  // script on the origin), so it is re-validated on every read.
  read() {
    try {
      const raw = JSON.parse(localStorage.getItem(this.key));
      if (!Array.isArray(raw)) return [];
      return raw
        .filter((l) => l && typeof l === "object" && getProduct(l.id))
        .map((l) => ({ id: cleanText(l.id), size: cleanText(l.size), qty: cleanQty(l.qty) }));
    } catch (err) {
      return [];
    }
  },
  write(lines) {
    localStorage.setItem(this.key, JSON.stringify(lines));
    document.dispatchEvent(new CustomEvent("bag:change", { detail: lines }));
  },
  lineKey(id, size) {
    return `${id}::${size || ""}`;
  },
  add(id, size, qty = 1) {
    const lines = this.read();
    const key = this.lineKey(id, size);
    const existing = lines.find((l) => this.lineKey(l.id, l.size) === key);
    if (existing) existing.qty = cleanQty(existing.qty + cleanQty(qty));
    else lines.push({ id: cleanText(id), size: cleanText(size), qty: cleanQty(qty) });
    this.write(lines);
  },
  setQty(id, size, qty) {
    const lines = this.read()
      .map((l) => (this.lineKey(l.id, l.size) === this.lineKey(id, size) ? { ...l, qty: Number(qty) } : l))
      .filter((l) => l.qty > 0)
      .map((l) => ({ ...l, qty: cleanQty(l.qty) }));
    this.write(lines);
  },
  remove(id, size) {
    this.write(this.read().filter((l) => this.lineKey(l.id, l.size) !== this.lineKey(id, size)));
  },
  count() {
    return this.read().reduce((sum, l) => sum + l.qty, 0);
  },
  subtotal() {
    return this.read().reduce((sum, l) => sum + (getProduct(l.id)?.price || 0) * l.qty, 0);
  },
};

/* ---------- wishlist ---------- */
const Wishlist = {
  key: "quophy.wishlist",
  read() {
    try {
      const raw = JSON.parse(localStorage.getItem(this.key));
      return Array.isArray(raw) ? raw.filter((id) => typeof id === "string").map(cleanText) : [];
    } catch (err) {
      return [];
    }
  },
  has(id) {
    return this.read().includes(id);
  },
  toggle(id) {
    const list = this.read();
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, cleanText(id)];
    localStorage.setItem(this.key, JSON.stringify(next));
    return next.includes(id);
  },
};

/* ---------- product card ---------- */
function productCard(product, { eager = false } = {}) {
  const loading = eager ? "eager" : "lazy";
  return `
    <article class="card reveal">
      <a class="card__media" href="${productUrl(product.id)}" aria-label="${escapeHtml(product.name)}">
        <img src="${product.images[0]}" alt="${escapeHtml(product.name)}" loading="${loading}" width="600" height="800">
        <img class="card__img--alt" src="${product.lifestyle}" alt="" aria-hidden="true" loading="lazy" width="600" height="800">
        ${product.badge ? `<span class="card__flag">${escapeHtml(product.badge)}</span>` : ""}
      </a>
      <button class="card__wish${Wishlist.has(product.id) ? " is-active" : ""}" data-wish="${product.id}"
        aria-label="Add ${escapeHtml(product.name)} to wishlist" aria-pressed="${Wishlist.has(product.id)}">${ICONS.heart}</button>
      <div class="card__body">
        <h3 class="card__name"><a href="${productUrl(product.id)}">${escapeHtml(product.name)}</a></h3>
        <p class="card__price">${money(product.price)}</p>
      </div>
    </article>`;
}

/* ---------- shell rendering ---------- */
function renderHeader() {
  const mount = $("[data-shell='header']");
  if (!mount) return;
  const transparent = document.body.dataset.header === "transparent";
  mount.outerHTML = `
    <header class="header${transparent ? " is-transparent" : ""}" data-header>
      <div class="wrap header__inner">
        <a class="header__contact" href="services.html#contact">
          ${ICONS.plus} Contact Us
        </a>
        <a class="header__logo" href="index.html" aria-label="${BRAND.name} — home">${BRAND.name}</a>
        <ul class="header__actions">
          <li>
            <button class="icon-btn" data-open="bag" aria-label="My shopping bag" aria-expanded="false">
              ${ICONS.bag}<span class="bag-count" data-bag-count hidden>0</span>
            </button>
          </li>
          <li><a class="icon-btn" href="services.html#contact" aria-label="My account">${ICONS.user}</a></li>
          <li><button class="icon-btn" data-open="search" aria-label="Search" aria-expanded="false">${ICONS.search}</button></li>
          <li>
            <button class="icon-btn header__menu-btn" data-open="menu" aria-label="Open menu" aria-expanded="false">
              ${ICONS.menu}<span class="header__menu-label">Menu</span>
            </button>
          </li>
        </ul>
      </div>
    </header>`;
}

function renderMenu() {
  const items = NAV.map((item, i) => {
    if (!item.children) {
      return `<li><a class="menu-list__link" href="${item.href}">${escapeHtml(item.label)}</a></li>`;
    }
    return `
      <li>
        <button class="menu-list__btn" aria-expanded="false" aria-controls="menu-sub-${i}">
          ${escapeHtml(item.label)} ${ICONS.chevron}
        </button>
        <div class="menu-sub" id="menu-sub-${i}">
          ${item.children.map((c) => `<a href="${c.href}">${escapeHtml(c.label)}</a>`).join("")}
        </div>
      </li>`;
  }).join("");

  return `
    <aside class="panel" id="panel-menu" role="dialog" aria-modal="true" aria-label="Main menu" data-panel="menu">
      <div class="panel__head">
        <span class="panel__title">Menu</span>
        <button class="icon-btn" data-close aria-label="Close menu">${ICONS.close}</button>
      </div>
      <div class="panel__body">
        <nav aria-label="Main">
          <ul class="menu-list">${items}</ul>
          <ul class="menu-secondary">
            ${NAV_SECONDARY.map((n) => `<li><a href="${n.href}">${escapeHtml(n.label)}</a></li>`).join("")}
            <li><a href="tel:${BRAND.phone.replace(/\s/g, "")}">${BRAND.phone}</a></li>
          </ul>
        </nav>
      </div>
    </aside>`;
}

function renderSearch() {
  return `
    <div class="search" id="panel-search" role="dialog" aria-modal="true" aria-label="Search" data-panel="search">
      <div class="wrap">
        <div class="search__inner">
          <label class="visually-hidden" for="search-input">Search ${BRAND.name}</label>
          <input class="search__field" id="search-input" type="search" placeholder="What are you looking for?" autocomplete="off">
          <button class="icon-btn" data-close aria-label="Close search">${ICONS.close}</button>
        </div>
        <div class="search__results" data-search-results></div>
      </div>
    </div>`;
}

function renderMiniBag() {
  return `
    <aside class="panel" id="panel-bag" role="dialog" aria-modal="true" aria-label="Shopping bag" data-panel="bag">
      <div class="panel__head">
        <span class="panel__title">Shopping Bag</span>
        <button class="icon-btn" data-close aria-label="Close shopping bag">${ICONS.close}</button>
      </div>
      <div class="panel__body" data-mini-bag></div>
      <div class="panel__foot" data-mini-foot></div>
    </aside>`;
}

function renderFooter() {
  const mount = $("[data-shell='footer']");
  if (!mount) return;
  mount.outerHTML = `
    <section class="section newsletter">
      <div class="wrap newsletter__inner">
        <h2 class="display" style="font-size: var(--fs-h2)">Sign up for ${BRAND.name} updates</h2>
        <p class="lede">Collection launches, private previews and the news of the house, twice a month.</p>
        <form class="newsletter__form" data-newsletter novalidate>
          <label class="visually-hidden" for="newsletter-email">Email address</label>
          <input id="newsletter-email" type="email" name="email" placeholder="Email address" required>
          <button class="btn" type="submit">Subscribe</button>
        </form>
        <p class="form-msg" data-newsletter-msg role="status"></p>
      </div>
    </section>
    <footer class="footer">
      <div class="wrap">
        <div class="footer__cols">
          <div>
            <h3 class="footer__title">May we help you?</h3>
            <ul class="footer__links">
              <li><a href="services.html#contact">Contact Us</a></li>
              <li><a href="bag.html">My Order</a></li>
              <li><a href="services.html#faq">FAQs</a></li>
              <li><a href="services.html#shipping">Shipping &amp; Returns</a></li>
              <li><a href="stores.html">Store Locator</a></li>
            </ul>
          </div>
          <div>
            <h3 class="footer__title">The House</h3>
            <ul class="footer__links">
              <li><a href="world.html">About ${BRAND.name}</a></li>
              <li><a href="world.html#craft">Craft &amp; Atelier</a></li>
              <li><a href="world.html#sustainability">Sustainability</a></li>
              <li><a href="world.html#careers">Careers</a></li>
              <li><a href="world.html#legal">Legal &amp; Privacy</a></li>
            </ul>
          </div>
          <div>
            <h3 class="footer__title">Services</h3>
            <ul class="footer__links">
              <li><a href="services.html">Discover our services</a></li>
              <li><a href="services.html#appointment">Book an Appointment</a></li>
              <li><a href="services.html#personalisation">Personalisation</a></li>
              <li><a href="services.html#collect">Collect in Store</a></li>
            </ul>
          </div>
          <div>
            <h3 class="footer__title">Client Services</h3>
            <ul class="footer__links">
              <li><a href="tel:${BRAND.phone.replace(/\s/g, "")}">${BRAND.phone}</a></li>
              <li><a href="mailto:${BRAND.email}">${BRAND.email}</a></li>
              <li>Monday to Saturday, 9:00–20:00</li>
            </ul>
          </div>
        </div>
        <div class="footer__bottom">
          <p>© ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.</p>
          <ul class="footer__social">
            <li><a href="#" aria-label="Instagram">${ICONS.instagram}</a></li>
            <li><a href="#" aria-label="Facebook">${ICONS.facebook}</a></li>
            <li><a href="#" aria-label="X">${ICONS.x}</a></li>
            <li><a href="#" aria-label="YouTube">${ICONS.youtube}</a></li>
          </ul>
        </div>
      </div>
    </footer>`;
}

/* ---------- overlay controller ---------- */
const Overlay = {
  current: null,
  trigger: null,
  open(name, trigger) {
    if (this.current) this.close();
    const panel = $(`[data-panel="${name}"]`);
    if (!panel) return;
    this.current = panel;
    this.trigger = trigger || null;
    panel.classList.add("is-open");
    $("[data-scrim]").classList.add("is-open");
    document.body.classList.add("is-locked");
    if (trigger) trigger.setAttribute("aria-expanded", "true");
    const focusable = panel.querySelector("input, button, a[href]");
    if (focusable) focusable.focus({ preventScroll: true });
    document.addEventListener("keydown", this._onKey);
  },
  close() {
    if (!this.current) return;
    this.current.classList.remove("is-open");
    $("[data-scrim]").classList.remove("is-open");
    document.body.classList.remove("is-locked");
    if (this.trigger) {
      this.trigger.setAttribute("aria-expanded", "false");
      this.trigger.focus({ preventScroll: true });
    }
    this.current = null;
    this.trigger = null;
    document.removeEventListener("keydown", this._onKey);
  },
  _onKey(event) {
    if (event.key === "Escape") Overlay.close();
    if (event.key !== "Tab" || !Overlay.current) return;
    const nodes = $$('a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])', Overlay.current)
      .filter((el) => el.offsetParent !== null);
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  },
};

function toast(message) {
  const el = $("[data-toast]");
  if (!el) return;
  el.textContent = message;
  el.classList.add("is-open");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("is-open"), 2600);
}

/* ---------- mini bag ---------- */
function paintBag() {
  const count = Bag.count();
  $$("[data-bag-count]").forEach((el) => {
    el.textContent = count;
    el.hidden = count === 0;
  });

  const body = $("[data-mini-bag]");
  const foot = $("[data-mini-foot]");
  if (!body || !foot) return;

  const lines = Bag.read();
  if (!lines.length) {
    body.innerHTML = `<p class="mini-bag__empty">Your shopping bag is empty.</p>`;
    foot.innerHTML = `<a class="btn btn--ghost btn--full" href="collections.html">Continue shopping</a>`;
    return;
  }

  body.innerHTML = lines
    .map((line) => {
      const product = getProduct(line.id);
      return `
        <div class="mini-bag__line">
          <a href="${productUrl(product.id)}"><img src="${product.images[0]}" alt="${escapeHtml(product.name)}" loading="lazy"></a>
          <div class="stack" style="--sp-4: 6px">
            <a class="mini-bag__name" href="${productUrl(product.id)}">${escapeHtml(product.name)}</a>
            <p class="mini-bag__meta">${line.size ? `Size ${escapeHtml(line.size)} · ` : ""}Qty ${line.qty}</p>
            <p class="mini-bag__meta">${money(product.price * line.qty)}</p>
            <button class="mini-bag__remove" data-mini-remove data-id="${product.id}" data-size="${escapeHtml(line.size)}">Remove</button>
          </div>
        </div>`;
    })
    .join("");

  foot.innerHTML = `
    <p class="mini-bag__total"><span>Subtotal</span><span>${money(Bag.subtotal())}</span></p>
    <a class="btn btn--full" href="bag.html">View bag &amp; checkout</a>`;
}

/* ---------- search ---------- */
function paintSearch(query) {
  const wrap = $("[data-search-results]");
  if (!wrap) return;
  const q = query.trim().toLowerCase();
  if (q.length < 2) {
    wrap.innerHTML = `<p class="search__empty">Start typing to search the collection.</p>`;
    return;
  }
  const hits = PRODUCTS.filter((p) =>
    [p.name, p.category, p.color, p.gender].join(" ").toLowerCase().includes(q)
  ).slice(0, 6);

  wrap.innerHTML = hits.length
    ? `<ul>${hits
        .map(
          (p) => `
        <li>
          <a class="search__result" href="${productUrl(p.id)}">
            <img src="${p.images[0]}" alt="" loading="lazy">
            <span>
              <span style="display:block">${escapeHtml(p.name)}</span>
              <span class="mini-bag__meta">${money(p.price)}</span>
            </span>
          </a>
        </li>`
        )
        .join("")}</ul>`
    : `<p class="search__empty">No results for “${escapeHtml(query)}”. Try “bag”, “coat” or “loafer”.</p>`;
}

/* ---------- scroll reveal ---------- */
function observeReveals(root = document) {
  const nodes = $$(".reveal:not(.is-visible)", root);
  if (!("IntersectionObserver" in window)) {
    nodes.forEach((n) => n.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px" }
  );
  nodes.forEach((n) => io.observe(n));
}

/* ---------- boot ---------- */
function initShell() {
  renderHeader();
  renderFooter();
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="scrim" data-scrim></div>${renderMenu()}${renderSearch()}${renderMiniBag()}<div class="toast" data-toast role="status" aria-live="polite"></div>`
  );

  paintBag();
  paintSearch("");

  document.addEventListener("click", (event) => {
    const opener = event.target.closest("[data-open]");
    if (opener) {
      Overlay.open(opener.dataset.open, opener);
      return;
    }
    if (event.target.closest("[data-close]") || event.target.closest("[data-scrim]")) {
      Overlay.close();
      return;
    }
    const submenu = event.target.closest(".menu-list__btn");
    if (submenu) {
      const panel = document.getElementById(submenu.getAttribute("aria-controls"));
      const open = submenu.getAttribute("aria-expanded") === "true";
      submenu.setAttribute("aria-expanded", String(!open));
      panel.classList.toggle("is-open", !open);
      return;
    }
    const remove = event.target.closest("[data-mini-remove]");
    if (remove) {
      Bag.remove(remove.dataset.id, remove.dataset.size);
      return;
    }
    const wish = event.target.closest("[data-wish]");
    if (wish) {
      const active = Wishlist.toggle(wish.dataset.wish);
      wish.classList.toggle("is-active", active);
      wish.setAttribute("aria-pressed", String(active));
      toast(active ? "Added to wishlist" : "Removed from wishlist");
    }
  });

  document.addEventListener("input", (event) => {
    if (event.target.id === "search-input") paintSearch(event.target.value);
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-newsletter]");
    if (!form) return;
    event.preventDefault();
    const input = form.querySelector("input");
    const msg = $("[data-newsletter-msg]");
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    msg.textContent = valid
      ? "Thank you — please confirm your subscription by email."
      : "Please enter a valid email address.";
    if (valid) form.reset();
  });

  document.addEventListener("bag:change", paintBag);

  // transparent header turns solid once scrolled past the hero
  const header = $("[data-header]");
  if (header && header.classList.contains("is-transparent")) {
    const onScroll = () => {
      header.classList.toggle("is-solid", window.scrollY > window.innerHeight * 0.7);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  observeReveals();
}

document.addEventListener("DOMContentLoaded", initShell);
