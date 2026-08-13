/* Emporio Armani storefront — vanilla JS application shell, routing and views. */
(function () {
  function showFatal(detail) {
    console.error("[app] " + detail);
    const view = document.querySelector("#view");
    if (!view) return;
    view.innerHTML =
      '<div class="site-padding" style="padding:96px 16px;text-align:center">' +
      '<h1 class="page-title">Something went wrong</h1>' +
      '<p class="muted" style="margin-top:12px">This page could not be displayed. Please reload and try again.</p></div>';
  }

  const missing = ["Catalog", "Store", "SITE"].filter((name) => !window[name]);
  if (missing.length) {
    showFatal("missing global(s): " + missing.join(", ") + " — a script failed to load.");
    return;
  }

  const C = window.Catalog;
  const S = window.Store;
  const SITE = window.SITE;
  const fmt = C.formatPrice;

  /* ------------------------------------------------------------------ utils */
  const esc = (value) =>
    String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const titleCase = (value) =>
    String(value)
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const qs = (sel, root) => (root || document).querySelector(sel);
  const qsa = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  const ICONS = {
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    bag: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
    heart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M12 20s-7-4.5-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.5 12 20 12 20z"/></svg>',
    user: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4S18.3 16.4 19.5 20"/></svg>',
    menu: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    filter: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 6h18M6 12h12M10 18h4"/></svg>',
  };

  let toastTimer = null;
  function toast(message) {
    let node = qs(".toast");
    if (!node) {
      node = document.createElement("div");
      node.className = "toast";
      document.body.appendChild(node);
    }
    node.textContent = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.remove(), 2600);
  }

  const lockScroll = (locked) => document.body.classList.toggle("no-scroll", locked);

  /* ------------------------------------------------------------- components */
  function tile(product) {
    const sale = product.salePrice != null;
    const off = sale ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
    const second = product.images[1] || product.images[0];
    const wished = S.isWishlisted(product.code);
    return (
      '<article class="tile" data-code="' + esc(product.code) + '">' +
      '<a class="tile-media" href="#/p/' + esc(product.slug) + '">' +
      '<img src="' + esc(product.images[0]) + '" alt="' + esc(product.name) + '" loading="lazy">' +
      '<img class="alt" src="' + esc(second) + '" alt="" loading="lazy">' +
      (product.newSeason ? '<span class="tile-badge">New Season</span>' : "") +
      "</a>" +
      '<button class="tile-wish' + (wished ? " wish-on" : "") + '" data-action="wish" data-code="' +
      esc(product.code) + '" aria-label="Add to wishlist" aria-pressed="' + wished + '">' + ICONS.heart + "</button>" +
      '<div class="tile-body">' +
      '<a class="tile-name" href="#/p/' + esc(product.slug) + '">' + esc(product.name) + "</a>" +
      '<div class="tile-price">' +
      (sale
        ? '<span class="was">' + fmt(product.price) + '</span><span class="now">' + fmt(product.salePrice) +
          '</span><span class="off">-' + off + "%</span>"
        : fmt(product.price)) +
      "</div>" +
      '<div class="tile-colors">' + esc(product.color) +
      (product.extraColors ? " + " + product.extraColors + " color" + (product.extraColors > 1 ? "s" : "") : "") +
      "</div>" +
      '<button class="tile-add" data-action="quick-add" data-code="' + esc(product.code) + '">Add to cart</button>' +
      "</div></article>"
    );
  }

  const grid = (products) =>
    products.length
      ? '<div class="grid">' + products.map(tile).join("") + "</div>"
      : '<p class="site-padding muted">No products match your selection.</p>';

  const breadcrumbs = (items) =>
    '<nav class="breadcrumbs site-padding" aria-label="Breadcrumb">' +
    items
      .map((item, index) => {
        const label = esc(item.label);
        const cell = item.href ? '<a href="' + esc(item.href) + '">' + label + "</a>" : label;
        return cell + (index < items.length - 1 ? "<span>/</span>" : "");
      })
      .join("") +
    "</nav>";

  /* ------------------------------------------------------------------ chrome */
  function renderHeader() {
    const nav = SITE.nav
      .map((entry, index) => '<a href="' + esc(entry.href) + '" data-nav="' + index + '">' + esc(entry.label) + "</a>")
      .join("");

    const menus = SITE.nav
      .map((entry, index) =>
        entry.columns
          ? '<div class="megamenu" data-menu="' + index + '"><div class="megamenu-cols">' +
            entry.columns
              .map(
                (col) =>
                  "<div><h3>" + esc(col.title) + "</h3><ul>" +
                  col.links.map((l) => '<li><a href="' + esc(l[1]) + '">' + esc(l[0]) + "</a></li>").join("") +
                  "</ul></div>"
              )
              .join("") +
            "</div></div>"
          : ""
      )
      .join("");

    qs("#header").innerHTML =
      '<div class="promo" id="promo"></div>' +
      '<div class="site-header" id="site-header">' +
      '<div class="header-bar site-padding">' +
      '<div style="display:flex;align-items:center;gap:14px">' +
      '<button class="burger icon-btn" data-action="open-menu" aria-label="Menu">' + ICONS.menu + "</button>" +
      '<nav class="header-nav">' + nav + "</nav>" +
      "</div>" +
      '<a class="wordmark" href="#/">Emporio Armani</a>' +
      '<div class="header-actions">' +
      '<button class="icon-btn" data-action="open-search" aria-label="Search">' + ICONS.search + "</button>" +
      '<a class="icon-btn" href="#/wishlist" aria-label="Wishlist">' + ICONS.heart +
      '<span class="icon-badge hidden" id="wish-badge"></span></a>' +
      '<a class="icon-btn" href="#/account" aria-label="My account">' + ICONS.user + "</a>" +
      '<button class="icon-btn" data-action="open-cart" aria-label="Shopping bag">' + ICONS.bag +
      '<span class="icon-badge hidden" id="cart-badge"></span></button>' +
      "</div></div>" + menus + "</div>";

    const header = qs("#site-header");
    header.addEventListener("mouseleave", closeMega);
    qsa("[data-nav]", header).forEach((link) => {
      link.addEventListener("mouseenter", () => openMega(link.dataset.nav));
      link.addEventListener("focus", () => openMega(link.dataset.nav));
      link.addEventListener("click", closeMega);
    });
    qsa(".megamenu a", header).forEach((link) => link.addEventListener("click", closeMega));

    rotatePromo();
    clearInterval(promoTimer);
    promoTimer = setInterval(rotatePromo, 5000);
  }

  let promoIndex = 0;
  let promoTimer = null;
  function rotatePromo() {
    const node = qs("#promo");
    if (!node || !SITE.promos.length) {
      clearInterval(promoTimer);
      return;
    }
    const promo = SITE.promos[promoIndex % SITE.promos.length];
    node.innerHTML =
      '<span class="promo-index">' + ((promoIndex % SITE.promos.length) + 1) + " / " + SITE.promos.length + "</span>" +
      '<a href="' + esc(promo.href) + '">' + esc(promo.text) + "</a>";
    promoIndex += 1;
  }

  const openMega = (index) => {
    qsa(".megamenu").forEach((m) => m.classList.toggle("open", m.dataset.menu === String(index)));
  };
  const closeMega = () => qsa(".megamenu").forEach((m) => m.classList.remove("open"));

  function renderFooter() {
    qs("#footer").innerHTML =
      '<footer class="site-footer">' +
      '<div class="footer-top">' +
      "<div><h3 class=\"label\" style=\"margin-bottom:12px\">Newsletter</h3>" +
      '<form class="newsletter" data-action="newsletter">' +
      '<input class="field" type="email" name="email" placeholder="Email" aria-label="Email" required>' +
      '<button class="btn btn-primary btn-auto" type="submit">Sign up</button>' +
      '</form><p class="tiny muted" id="newsletter-msg" style="margin-top:10px"></p></div>' +
      '<div><h3 class="label" style="margin-bottom:12px">Store locator</h3>' +
      '<a class="underline-link" href="#/stores">Our locations</a></div>' +
      '<div><h3 class="label" style="margin-bottom:12px">Country / Region</h3>' +
      '<p class="muted" style="margin:0">United States (USD) | English</p></div>' +
      "</div>" +
      '<div class="footer-cols">' +
      SITE.footer
        .map(
          (col) =>
            "<div><h3>" + esc(col.title) + "</h3><ul>" +
            col.links.map((l) => '<li><a href="' + esc(l[1]) + '">' + esc(l[0]) + "</a></li>").join("") +
            "</ul></div>"
        )
        .join("") +
      "</div>" +
      '<div class="footer-bottom"><span>Follow us on: Instagram · Facebook · YouTube · TikTok</span>' +
      "<span>Copyright © 2026 Giorgio Armani S.p.A. - All Rights Reserved</span></div>" +
      "</footer>";
  }

  function renderBadges() {
    const count = S.cartCount();
    const cartBadge = qs("#cart-badge");
    if (cartBadge) {
      cartBadge.textContent = count;
      cartBadge.classList.toggle("hidden", count === 0);
    }
    const wishBadge = qs("#wish-badge");
    if (wishBadge) {
      wishBadge.textContent = S.wishlist.length;
      wishBadge.classList.toggle("hidden", S.wishlist.length === 0);
    }
    qsa("[data-action='wish']").forEach((btn) => {
      const on = S.isWishlisted(btn.dataset.code);
      btn.classList.toggle("wish-on", on);
      btn.setAttribute("aria-pressed", String(on));
    });
  }

  /* ---------------------------------------------------------------- overlays */
  const overlays = () => qs("#overlays");

  function closeOverlays() {
    overlays().innerHTML = "";
    lockScroll(false);
  }

  function openCart() {
    const lines = S.cartLines();
    const body = lines.length
      ? lines
          .map(
            (e) =>
              '<div class="cart-line">' +
              '<a href="#/p/' + esc(e.product.slug) + '"><img src="' + esc(e.product.images[0]) + '" alt=""></a>' +
              '<div style="flex:1">' +
              '<a href="#/p/' + esc(e.product.slug) + '">' + esc(e.product.name) + "</a>" +
              '<p class="tiny muted" style="margin:4px 0">' + esc(e.product.color) + " · Size " + esc(e.line.size) + "</p>" +
              "<p style=\"margin:0 0 8px\">" + fmt(C.priceOf(e.product)) + "</p>" +
              '<div style="display:flex;align-items:center;gap:14px">' +
              '<span class="qty">' +
              '<button data-action="qty" data-code="' + esc(e.product.code) + '" data-size="' + esc(e.line.size) +
              '" data-delta="-1" aria-label="Decrease quantity">−</button>' +
              "<span>" + e.line.quantity + "</span>" +
              '<button data-action="qty" data-code="' + esc(e.product.code) + '" data-size="' + esc(e.line.size) +
              '" data-delta="1" aria-label="Increase quantity">+</button>' +
              "</span>" +
              '<button class="tiny underline-link" data-action="remove" data-code="' + esc(e.product.code) +
              '" data-size="' + esc(e.line.size) + '">Remove</button>' +
              "</div></div></div>"
          )
          .join("")
      : '<p class="muted">Your shopping bag is empty.</p>';

    overlays().innerHTML =
      '<div class="scrim" data-action="close-overlay"></div>' +
      '<aside class="drawer drawer-right" role="dialog" aria-label="Shopping bag">' +
      '<div class="drawer-head"><span class="label">Shopping bag (' + S.cartCount() + ")</span>" +
      '<button data-action="close-overlay" aria-label="Close bag">' + ICONS.close + "</button></div>" +
      '<div class="drawer-body">' + body + "</div>" +
      (lines.length
        ? '<div class="drawer-foot">' +
          '<div style="display:flex;justify-content:space-between"><span>Subtotal</span><span id="mini-subtotal">' +
          fmt(S.subtotal()) + "</span></div>" +
          '<a class="btn btn-secondary" href="#/cart" data-action="close-after">View bag</a>' +
          '<a class="btn btn-primary" href="#/checkout" data-action="close-after">Checkout</a></div>'
        : "") +
      "</aside>";
    lockScroll(true);
  }

  function openMenu() {
    overlays().innerHTML =
      '<div class="scrim" data-action="close-overlay"></div>' +
      '<aside class="drawer drawer-left" role="dialog" aria-label="Menu">' +
      '<div class="drawer-head"><span class="label">Menu</span>' +
      '<button data-action="close-overlay" aria-label="Close menu">' + ICONS.close + "</button></div>" +
      '<div class="drawer-body">' +
      SITE.nav
        .map((entry) =>
          entry.columns
            ? '<div class="mobile-group"><button data-action="toggle-group">' + esc(entry.label) + "<span>+</span></button><ul>" +
              entry.columns
                .flatMap((col) => col.links)
                .map((l) => '<li><a href="' + esc(l[1]) + '" data-action="close-after">' + esc(l[0]) + "</a></li>")
                .join("") +
              "</ul></div>"
            : '<div class="mobile-group"><button data-action="go" data-href="' + esc(entry.href) + '">' +
              esc(entry.label) + "<span>›</span></button></div>"
        )
        .join("") +
      '<ul style="margin-top:24px;display:grid;gap:12px">' +
      '<li><a href="#/wishlist" data-action="close-after">Wishlist</a></li>' +
      '<li><a href="#/account" data-action="close-after">My account</a></li>' +
      '<li><a href="#/help" data-action="close-after">Client service</a></li>' +
      '<li><a href="#/stores" data-action="close-after">Store locator</a></li>' +
      "</ul></div></aside>";
    lockScroll(true);
  }

  function openSearch() {
    overlays().innerHTML =
      '<div class="search-overlay" role="dialog" aria-label="Search">' +
      '<div class="search-head">' + ICONS.search +
      '<input id="search-input" type="search" placeholder="What are you looking for?" aria-label="Search">' +
      '<button data-action="close-overlay" aria-label="Close search">' + ICONS.close + "</button></div>" +
      '<div class="search-body" id="search-body"></div></div>';
    lockScroll(true);

    const input = qs("#search-input");
    input.focus();
    renderSearchSuggestions();
    input.addEventListener("input", () => renderSearchSuggestions(input.value));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && input.value.trim()) {
        closeOverlays();
        location.hash = "#/search?q=" + encodeURIComponent(input.value.trim());
      }
    });
  }

  function renderSearchSuggestions(query) {
    const body = qs("#search-body");
    if (!body) return;
    const results = C.search(query, 8);
    if (!query || !query.trim()) {
      body.innerHTML =
        '<p class="eyebrow">Popular searches</p><ul style="display:flex;flex-wrap:wrap;gap:10px;margin-top:12px">' +
        SITE.popularSearches
          .map((term) => '<li><button class="chip" data-action="search-term" data-term="' + esc(term) + '">' + esc(term) + "</button></li>")
          .join("") +
        "</ul>";
      return;
    }
    body.innerHTML =
      '<p class="eyebrow">' + results.length + " result" + (results.length === 1 ? "" : "s") + "</p>" +
      (results.length
        ? '<div class="search-results" style="margin-top:16px">' + results.map(tile).join("") + "</div>" +
          '<div style="margin-top:24px"><a class="underline-link" href="#/search?q=' +
          encodeURIComponent(query.trim()) + '" data-action="close-after">See all results</a></div>'
        : '<p class="muted" style="margin-top:12px">No products found.</p>');
  }

  /* ------------------------------------------------------------------- views */
  const views = {};

  views.home = function () {
    const blocks = C.home;
    const editorial = (block, tall) =>
      '<section class="editorial ' + (tall ? "editorial-tall" : "editorial-short") + '">' +
      (block.video
        ? '<video src="' + esc(block.video) + '" autoplay muted loop playsinline></video>'
        : '<img src="' + esc(block.image || block.mobileImage) + '" alt="' + esc(block.title || "") + '">') +
      '<div class="editorial-overlay"></div>' +
      '<div class="editorial-content">' +
      (block.title ? "<h2>" + esc(block.title) + "</h2>" : "") +
      (block.ctas && block.ctas.length
        ? '<div class="editorial-ctas">' +
          block.ctas.map((cta) => '<a href="' + esc(hrefFromLive(cta.href)) + '">' + esc(cta.label) + "</a>").join("") +
          "</div>"
        : "") +
      "</div></section>";

    const newArrivals = C.newArrivals().slice(0, 8);
    return (
      blocks.slice(0, 3).map((b, i) => editorial(b, i === 0)).join("") +
      '<div class="site-padding section-head"><h2 class="page-title">New arrivals</h2>' +
      '<a class="underline-link label" href="#/c/new-arrivals/man">View all</a></div>' +
      grid(newArrivals) +
      blocks.slice(3).map((b) => editorial(b, false)).join("") +
      '<section class="site-padding" style="padding-top:56px;padding-bottom:56px;text-align:center">' +
      '<p class="eyebrow">Follow us</p><h2 class="page-title" style="margin-top:8px">#EmporioArmani</h2>' +
      '<p class="muted" style="margin-top:12px">Instagram · Facebook · YouTube · TikTok</p></section>'
    );
  };

  // Live-site hrefs stored in the scraped editorial data -> local hash routes.
  function hrefFromLive(href) {
    if (!href) return "#/";
    const path = href.replace(/^https?:\/\/[^/]+/, "").replace(/^\/en-us\/emporio-armani\//, "").replace(/\/$/, "");
    if (!path || path === "experience") return "#/";
    if (C.getProduct(path)) return "#/p/" + path;
    return "#/c/" + path;
  }

  const listingState = { path: "", sizes: [], colors: [], saleOnly: false, sort: "recommended", shown: 12, open: false };

  views.listing = function (path) {
    if (listingState.path !== path) {
      Object.assign(listingState, { path: path, sizes: [], colors: [], saleOnly: false, sort: "recommended", shown: 12, open: false });
    }

    const segments = path.split("/");
    let products;
    let title;
    if (segments[0] === "sale") {
      products = C.saleProducts(segments[1]);
      title = (segments[1] ? titleCase(segments[1]) + "'s " : "") + "Sale";
    } else if (segments[0] === "new-arrivals") {
      products = C.newArrivals(segments[1]);
      title = (segments[1] ? titleCase(segments[1]) + "'s " : "") + "New Arrivals";
    } else {
      products = C.listing(path);
      const cat = C.getCategory(path);
      title = cat ? cat.title : segments.map(titleCase).join(" ");
    }

    if (!products.length) return views.notFound();

    const allSizes = [];
    const allColors = [];
    products.forEach((p) => {
      p.sizes.forEach((s) => { if (allSizes.indexOf(s) === -1) allSizes.push(s); });
      if (allColors.indexOf(p.color) === -1) allColors.push(p.color);
    });
    allColors.sort();

    let filtered = products.filter((p) => {
      if (listingState.saleOnly && p.salePrice == null) return false;
      if (listingState.colors.length && listingState.colors.indexOf(p.color) === -1) return false;
      if (listingState.sizes.length && !listingState.sizes.some((s) => p.sizes.indexOf(s) !== -1)) return false;
      return true;
    });

    if (listingState.sort === "price-asc") filtered = filtered.slice().sort((a, b) => C.priceOf(a) - C.priceOf(b));
    if (listingState.sort === "price-desc") filtered = filtered.slice().sort((a, b) => C.priceOf(b) - C.priceOf(a));
    if (listingState.sort === "name") filtered = filtered.slice().sort((a, b) => a.name.localeCompare(b.name));

    const visible = filtered.slice(0, listingState.shown);
    const activeCount = listingState.sizes.length + listingState.colors.length + (listingState.saleOnly ? 1 : 0);
    const children = C.childCategories(path);

    const crumbs = [{ label: "Home", href: "#/" }].concat(
      segments.map((seg, i) => ({
        label: titleCase(seg),
        href: i < segments.length - 1 ? "#/c/" + segments.slice(0, i + 1).join("/") : null,
      }))
    );

    return (
      breadcrumbs(crumbs) +
      '<div class="site-padding" style="padding-bottom:16px"><h1 class="page-title">' + esc(title) + "</h1></div>" +
      (children.length
        ? '<nav class="site-padding" style="display:flex;flex-wrap:wrap;gap:16px;padding-bottom:20px">' +
          children.map((c) => '<a class="underline-link tiny" href="#/c/' + esc(c.slug) + '">' + esc(c.label) + "</a>").join("") +
          "</nav>"
        : "") +
      '<div class="plp-bar"><span class="tiny" id="plp-count">' + filtered.length + " items</span>" +
      '<button class="label" data-action="toggle-filters" style="display:flex;gap:8px;align-items:center">' +
      ICONS.filter + "Sort &amp; filters" + (activeCount ? " (" + activeCount + ")" : "") + "</button></div>" +
      '<div class="filter-panel' + (listingState.open ? " open" : "") + '" id="filter-panel">' +
      '<div class="filter-group"><h4>Sort by</h4><div class="chips">' +
      [["recommended", "Recommended"], ["price-asc", "Price: low to high"], ["price-desc", "Price: high to low"], ["name", "Name A-Z"]]
        .map((o) => '<button class="chip' + (listingState.sort === o[0] ? " active" : "") + '" data-action="sort" data-value="' + o[0] + '">' + o[1] + "</button>")
        .join("") +
      "</div></div>" +
      '<div class="filter-group"><h4>Size</h4><div class="chips">' +
      allSizes
        .map((s) => '<button class="chip' + (listingState.sizes.indexOf(s) !== -1 ? " active" : "") + '" data-action="filter-size" data-value="' + esc(s) + '">' + esc(s) + "</button>")
        .join("") +
      "</div></div>" +
      '<div class="filter-group"><h4>Color</h4><div class="chips">' +
      allColors
        .map((c2) => '<button class="chip' + (listingState.colors.indexOf(c2) !== -1 ? " active" : "") + '" data-action="filter-color" data-value="' + esc(c2) + '">' + esc(c2) + "</button>")
        .join("") +
      "</div></div>" +
      '<div class="filter-group"><div class="chips">' +
      '<button class="chip' + (listingState.saleOnly ? " active" : "") + '" data-action="filter-sale">On sale only</button>' +
      (activeCount ? '<button class="chip" data-action="clear-filters">Clear filters</button>' : "") +
      "</div></div></div>" +
      grid(visible) +
      (visible.length < filtered.length
        ? '<div class="show-more"><button class="btn btn-secondary btn-auto" data-action="show-more">Show more (' +
          visible.length + "/" + filtered.length + ")</button></div>"
        : "")
    );
  };

  const pdpState = { slug: "", size: null, error: false };

  views.pdp = function (slug) {
    const product = C.getProduct(slug);
    if (!product) return views.notFound();
    if (pdpState.slug !== slug) Object.assign(pdpState, { slug: slug, size: null, error: false });

    const sale = product.salePrice != null;
    const variants = C.colorVariants(product);
    const related = C.related(product, 8);
    const wished = S.isWishlisted(product.code);

    return (
      breadcrumbs([
        { label: "Home", href: "#/" },
        { label: titleCase(product.gender), href: "#/c/" + product.gender },
        product.categories[0]
          ? { label: titleCase(product.sub || product.group), href: "#/c/" + product.categories[0] }
          : { label: titleCase(product.group) },
        { label: product.name },
      ]) +
      '<div class="pdp">' +
      '<div class="pdp-gallery">' +
      product.images
        .map(
          (src, i) =>
            '<button data-action="zoom" data-src="' + esc(src) + '" aria-label="Zoom image ' + (i + 1) + '">' +
            '<img src="' + esc(src) + '" alt="' + esc(product.name) + '" loading="lazy"></button>'
        )
        .join("") +
      "</div>" +
      '<div class="pdp-info">' +
      (product.newSeason ? '<p class="eyebrow">New season</p>' : "") +
      "<h1>" + esc(product.name) + "</h1>" +
      '<p style="margin:0 0 16px">' +
      (sale
        ? '<span class="was" style="text-decoration:line-through;color:var(--muted);margin-right:8px">' + fmt(product.price) +
          '</span><span style="color:var(--sale)">' + fmt(product.salePrice) + "</span>"
        : fmt(product.price)) +
      "</p>" +
      '<p class="tiny" style="margin:0">Color: ' + esc(product.color) + "</p>" +
      (variants.length > 1
        ? '<div class="swatches">' +
          variants
            .map(
              (v) =>
                '<a class="swatch' + (v.code === product.code ? " active" : "") + '" href="#/p/' + esc(v.slug) +
                '" title="' + esc(v.color) + '"><img src="' + esc(v.images[0]) + '" alt="' + esc(v.color) + '"></a>'
            )
            .join("") +
          "</div>"
        : "") +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:16px">' +
      '<span class="tiny">Size: ' + (pdpState.size ? esc(pdpState.size) : "Select") + "</span>" +
      '<span class="tiny underline-link">Size guide</span></div>' +
      '<div class="sizes">' +
      product.sizes
        .map((s) => '<button class="size' + (pdpState.size === s ? " active" : "") + '" data-action="pick-size" data-value="' + esc(s) + '">' + esc(s) + "</button>")
        .join("") +
      "</div>" +
      (pdpState.error ? '<p class="error" id="size-error">Please select a size.</p>' : "") +
      '<div class="pdp-actions">' +
      '<button class="btn btn-primary" data-action="add-to-cart" data-code="' + esc(product.code) + '">Add to cart</button>' +
      '<button class="wish' + (wished ? " wish-on" : "") + '" data-action="wish" data-code="' + esc(product.code) +
      '" aria-label="Add to wishlist" aria-pressed="' + wished + '">' + ICONS.heart + "</button></div>" +
      '<ul class="tiny muted" style="margin:18px 0 26px;display:grid;gap:6px">' +
      "<li>Estimated shipping within 4/6 business days</li>" +
      "<li>Free returns for all orders (some exclusions apply)</li>" +
      "<li>Find and reserve in store</li></ul>" +
      accordion("Information &amp; details",
        "<p>" + esc(product.description || "") + "</p>" +
        (product.bullets && product.bullets.length
          ? "<ul>" + product.bullets.map((b) => "<li>· " + esc(b) + "</li>").join("") + "</ul>"
          : "") +
        (product.composition ? "<p>" + esc(product.composition) + "</p>" : "") +
        '<p class="tiny">Product code: ' + esc(product.code) + "</p>") +
      accordion("Product care",
        "<p>Follow the care label. Professional dry cleaning is recommended for tailored and delicate items; wash jersey garments inside out at low temperature.</p>") +
      accordion("Shipping &amp; returns",
        "<p>Free standard shipping on orders over $ 250, otherwise $ 15. Returns are free within 14 days of delivery.</p>") +
      "</div></div>" +
      (related.length
        ? '<section><div class="site-padding section-head"><h2 class="page-title">You may also like</h2></div>' + grid(related) + "</section>"
        : "")
    );
  };

  const accordion = (title, body) =>
    '<div class="accordion"><button data-action="accordion">' + title + "<span>+</span></button>" +
    '<div class="accordion-body">' + body + "</div></div>";

  views.cart = function () {
    const lines = S.cartLines();
    if (!lines.length) {
      return (
        '<div class="site-padding" style="padding-top:40px;padding-bottom:60px">' +
        '<h1 class="page-title">Shopping bag</h1>' +
        '<p class="muted" style="margin:16px 0 24px">Your shopping bag is empty.</p>' +
        '<a class="btn btn-primary btn-auto" href="#/c/man/clothing/t-shirts">Continue shopping</a></div>'
      );
    }
    return (
      '<div class="site-padding" style="padding-top:40px;padding-bottom:60px">' +
      '<h1 class="page-title" style="margin-bottom:28px">Shopping bag</h1>' +
      '<div class="two-col"><div>' +
      lines
        .map(
          (e) =>
            '<div class="cart-line">' +
            '<a href="#/p/' + esc(e.product.slug) + '"><img src="' + esc(e.product.images[0]) + '" alt=""></a>' +
            '<div style="flex:1">' +
            '<a href="#/p/' + esc(e.product.slug) + '">' + esc(e.product.name) + "</a>" +
            '<p class="tiny muted" style="margin:4px 0">' + esc(e.product.color) + " · Size " + esc(e.line.size) +
            " · " + esc(e.product.code) + "</p>" +
            "<p style=\"margin:0 0 8px\">" + fmt(C.priceOf(e.product)) + "</p>" +
            '<div style="display:flex;align-items:center;gap:14px">' +
            '<span class="qty">' +
            '<button data-action="qty" data-code="' + esc(e.product.code) + '" data-size="' + esc(e.line.size) +
            '" data-delta="-1" aria-label="Decrease quantity">−</button><span>' + e.line.quantity + "</span>" +
            '<button data-action="qty" data-code="' + esc(e.product.code) + '" data-size="' + esc(e.line.size) +
            '" data-delta="1" aria-label="Increase quantity">+</button></span>' +
            '<button class="tiny underline-link" data-action="remove" data-code="' + esc(e.product.code) +
            '" data-size="' + esc(e.line.size) + '">Remove</button></div></div>' +
            "<div>" + fmt(C.priceOf(e.product) * e.line.quantity) + "</div></div>"
        )
        .join("") +
      "</div>" + summaryBox("#/checkout", "Proceed to checkout") + "</div></div>"
    );
  };

  const summaryBox = (href, label) =>
    '<aside class="summary"><h2 class="label" style="margin-bottom:16px">Order summary</h2><dl>' +
    '<div class="row"><dt>Subtotal</dt><dd id="sum-subtotal">' + fmt(S.subtotal()) + "</dd></div>" +
    '<div class="row"><dt>Shipping</dt><dd>' + (S.shipping() === 0 ? "Free" : fmt(S.shipping())) + "</dd></div>" +
    '<div class="row total"><dt>Total</dt><dd id="sum-total">' + fmt(S.total()) + "</dd></div></dl>" +
    (href ? '<a class="btn btn-primary" style="margin-top:22px" href="' + href + '">' + label + "</a>" : "") +
    "</aside>";

  const checkoutState = { step: "address", order: null };

  views.checkout = function () {
    if (checkoutState.order) {
      const order = checkoutState.order;
      return (
        '<div class="site-padding" style="padding:64px 16px;text-align:center">' +
        '<h1 class="page-title">Thank you for your order</h1>' +
        '<p style="margin-top:16px" id="order-confirmation">Order ' + esc(order.id) +
        " has been confirmed. A confirmation email was sent to " + esc(order.address.email) + ".</p>" +
        '<p class="muted">Total paid: ' + fmt(order.total) + "</p>" +
        '<div style="max-width:320px;margin:32px auto 0;display:grid;gap:10px">' +
        '<a class="btn btn-secondary" href="#/track/order">Track your order</a>' +
        '<a class="btn btn-primary" href="#/">Continue shopping</a></div></div>'
      );
    }

    const lines = S.cartLines();
    if (!lines.length) {
      return '<div class="site-padding" style="padding:64px 16px"><h1 class="page-title">Checkout</h1>' +
        '<p class="muted" style="margin-top:16px">Your shopping bag is empty.</p></div>';
    }

    const input = (name, label, type) =>
      '<label class="' + (name === "address" ? "full" : "") + '"><span class="tiny muted">' + label + "</span>" +
      '<input class="field" name="' + name + '" type="' + (type || "text") + '" required></label>';

    const form =
      checkoutState.step === "address"
        ? '<form class="form-grid" data-action="checkout-address">' +
          input("firstName", "First name") + input("lastName", "Last name") +
          input("email", "Email", "email") + input("address", "Address") +
          input("city", "City") + input("state", "State") +
          input("zip", "ZIP code") + input("country", "Country") +
          '<div class="full"><button class="btn btn-primary btn-auto" type="submit">Continue to payment</button></div></form>'
        : '<form class="form-grid" style="max-width:420px" data-action="checkout-payment">' +
          '<label class="full"><span class="tiny muted">Card number</span>' +
          '<input class="field" required placeholder="4242 4242 4242 4242"></label>' +
          '<label><span class="tiny muted">Expiry</span><input class="field" required placeholder="MM/YY"></label>' +
          '<label><span class="tiny muted">CVV</span><input class="field" required placeholder="123"></label>' +
          '<p class="tiny muted full">This is a demo checkout. No payment is processed and no card data is stored.</p>' +
          '<div class="full" style="display:grid;gap:10px">' +
          '<button class="btn btn-primary" type="submit">Place order</button>' +
          '<button class="btn btn-secondary" type="button" data-action="back-to-address">Back to shipping</button></div></form>';

    return (
      '<div class="site-padding" style="padding-top:40px;padding-bottom:60px"><div class="two-col"><div>' +
      '<h1 class="page-title" style="margin-bottom:28px">Checkout</h1>' +
      '<div class="steps label"><span class="' + (checkoutState.step === "address" ? "active" : "") + '">1. Shipping</span>' +
      '<span class="' + (checkoutState.step === "payment" ? "active" : "") + '">2. Payment</span></div>' +
      form + "</div>" + summaryBox(null, "") + "</div></div>"
    );
  };

  views.wishlist = function () {
    const products = S.wishlist.map(C.getByCode).filter(Boolean);
    return (
      '<div style="padding-top:40px">' +
      '<h1 class="page-title site-padding" style="margin-bottom:24px">Wishlist</h1>' +
      (products.length
        ? grid(products)
        : '<div class="site-padding"><p class="muted" style="margin-bottom:20px">Your wishlist is empty.</p>' +
          '<a class="btn btn-primary btn-auto" href="#/c/woman/bags">Discover the collection</a></div>') +
      "</div>"
    );
  };

  views.account = function () {
    if (!S.account) {
      return (
        '<div class="site-padding" style="padding:48px 16px;max-width:520px">' +
        '<h1 class="page-title" style="margin-bottom:24px">My account</h1>' +
        '<form data-action="sign-in" style="display:grid;gap:16px">' +
        '<label><span class="tiny muted">Email</span><input class="field" name="email" type="email" required></label>' +
        '<label><span class="tiny muted">Password</span><input class="field" name="password" type="password" required></label>' +
        '<button class="btn btn-primary" type="submit">Sign in</button>' +
        '<p class="tiny muted">Demo account area — details are stored locally in your browser only.</p></form></div>'
      );
    }
    return (
      '<div class="site-padding" style="padding:48px 16px">' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
      '<h1 class="page-title">Hello, ' + esc(S.account.firstName || S.account.email) + "</h1>" +
      '<button class="label underline-link" data-action="sign-out">Sign out</button></div>' +
      '<div class="two-col" style="margin-top:40px"><div>' +
      '<h2 class="label" style="margin-bottom:16px">Orders</h2>' +
      (S.orders.length
        ? S.orders
            .map(
              (o) =>
                '<div style="border-top:1px solid var(--line);padding:16px 0">' +
                '<div style="display:flex;justify-content:space-between"><span>Order ' + esc(o.id) + "</span><span>" +
                fmt(o.total) + "</span></div>" +
                '<p class="tiny muted" style="margin:4px 0 0">' + new Date(o.createdAt).toLocaleDateString("en-US") +
                " · " + esc(o.status) + " · " + o.lines.length + " item(s)</p></div>"
            )
            .join("")
        : '<p class="muted">You have no orders yet.</p>') +
      "</div><aside><h2 class=\"label\" style=\"margin-bottom:16px\">Shortcuts</h2>" +
      '<ul style="display:grid;gap:10px">' +
      '<li><a class="underline-link" href="#/wishlist">Wishlist (' + S.wishlist.length + ")</a></li>" +
      '<li><a class="underline-link" href="#/track/order">Track your order</a></li>' +
      '<li><a class="underline-link" href="#/track/return">Track my return</a></li></ul></aside></div></div>'
    );
  };

  views.search = function (query) {
    const results = C.search(query, 200);
    return (
      '<div style="padding-top:40px">' +
      '<div class="site-padding" style="padding-bottom:20px"><h1 class="page-title">Search</h1>' +
      '<p class="muted" style="margin-top:8px">' +
      (query ? results.length + ' results for "' + esc(query) + '"' : "Enter a search term to find products.") +
      "</p></div>" +
      (results.length ? grid(results) : "") +
      "</div>"
    );
  };

  views.stores = function (filter) {
    const term = String(filter || "").trim().toLowerCase();
    const list = SITE.stores.filter((s) => (s.name + " " + s.address).toLowerCase().indexOf(term) !== -1);
    return (
      '<div class="site-padding" style="padding:48px 16px">' +
      '<h1 class="page-title">Store locator</h1>' +
      '<p class="muted" style="margin:12px 0 28px;max-width:560px">Find an Emporio Armani boutique and book an appointment with a client advisor.</p>' +
      '<input class="field" style="max-width:420px" id="store-search" placeholder="Search by city or store name" aria-label="Search stores" value="' + esc(filter || "") + '">' +
      '<ul class="store-grid" style="margin-top:28px">' +
      list
        .map(
          (s) =>
            "<li><h2 class=\"label\">" + esc(s.name) + '</h2><p class="muted" style="margin:8px 0 0">' + esc(s.address) +
            '</p><p class="muted" style="margin:0">' + esc(s.phone) + '</p><p class="tiny muted" style="margin:8px 0 0">' +
            esc(s.hours) + "</p></li>"
        )
        .join("") +
      "</ul>" +
      (list.length ? "" : '<p class="muted" style="margin-top:20px">No stores match your search.</p>') +
      "</div>"
    );
  };

  views.track = function (kind) {
    const label = kind === "return" ? "Track my return" : "Track your order";
    return (
      '<div class="site-padding" style="padding:48px 16px">' +
      '<h1 class="page-title">' + label + "</h1>" +
      '<p class="muted" style="margin:12px 0 28px;max-width:600px">' +
      (kind === "return"
        ? "Enter the return number to follow the status of your refund. Refunds are issued within 14 days of receipt."
        : "Enter the order number from your confirmation email to see the latest shipping status.") +
      "</p>" +
      '<form data-action="track" data-kind="' + kind + '" style="display:grid;gap:16px;max-width:420px">' +
      '<label><span class="tiny muted">' + (kind === "return" ? "Return" : "Order") + " number</span>" +
      '<input class="field" name="reference" placeholder="EA12345678" required></label>' +
      '<label><span class="tiny muted">Email</span><input class="field" name="email" type="email" placeholder="you@example.com" required></label>' +
      '<button class="btn btn-primary" type="submit">Track</button>' +
      '<p id="track-result"></p></form></div>'
    );
  };

  views.content = function (key) {
    const page = SITE.pages[key];
    if (!page) return views.notFound();
    return (
      '<article class="site-padding content-page" style="padding:48px 16px">' +
      '<h1 class="page-title">' + esc(page.title) + "</h1>" +
      (page.intro ? '<p class="muted" style="margin-top:16px">' + esc(page.intro) + "</p>" : "") +
      '<div style="margin-top:40px">' +
      page.sections
        .map(
          (section) =>
            "<section><h2>" + esc(section.heading) + "</h2>" +
            section.body.map((p) => "<p>" + esc(p) + "</p>").join("") +
            (section.links
              ? '<ul style="display:grid;gap:6px;margin-top:10px">' +
                section.links.map((l) => '<li><a class="underline-link" href="' + esc(l[1]) + '">' + esc(l[0]) + "</a></li>").join("") +
                "</ul>"
              : "") +
            "</section>"
        )
        .join("") +
      "</div></article>"
    );
  };

  views.brand = function (key) {
    const brand = SITE.brands[key];
    if (!brand) return views.notFound();
    return (
      '<section class="editorial editorial-short"><img src="' + esc(brand.image) + '" alt="' + esc(brand.name) + '">' +
      '<div class="editorial-overlay"></div><div class="editorial-content"><h2>' + esc(brand.name) + "</h2></div></section>" +
      '<div class="site-padding" style="padding:48px 16px;max-width:720px">' +
      '<p class="muted" style="line-height:1.7">' + esc(brand.blurb) + "</p>" +
      '<p style="margin-top:28px">The ' + esc(brand.name) +
      ' catalogue is not part of this build. <a class="underline-link" href="#/">Explore Emporio Armani</a>.</p></div>'
    );
  };

  views.brandHub = function () {
    return (
      '<div style="padding-top:40px">' +
      '<h1 class="page-title site-padding" style="padding-bottom:24px">Choose your world</h1>' +
      '<div class="brand-grid">' +
      Object.keys(SITE.brands)
        .map(
          (key) =>
            '<a class="brand-card" href="#/brand/' + key + '"><img src="' + esc(SITE.brands[key].image) + '" alt="' +
            esc(SITE.brands[key].name) + '"><span>' + esc(SITE.brands[key].name) + "</span></a>"
        )
        .join("") +
      '<a class="brand-card" href="#/"><img src="' + esc(C.home[0].image) + '" alt="Emporio Armani"><span>Emporio Armani</span></a>' +
      "</div></div>"
    );
  };

  views.notFound = function () {
    return (
      '<div class="site-padding" style="padding:96px 16px;text-align:center">' +
      '<h1 class="page-title">Page not found</h1>' +
      '<p class="muted" style="margin-top:12px">The page you are looking for is no longer available.</p>' +
      '<a class="btn btn-primary btn-auto" style="margin-top:24px" href="#/">Back to homepage</a></div>'
    );
  };

  /* ------------------------------------------------------------------ router */
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, "");
    const [pathPart, queryPart] = raw.split("?");
    const segments = pathPart.split("/").filter(Boolean);
    const params = {};
    const decode = (value) => {
      try {
        return decodeURIComponent(value);
      } catch (err) {
        console.warn("[app] malformed URL escape in hash, using raw value", value, err);
        return value;
      }
    };
    (queryPart || "").split("&").filter(Boolean).forEach((pair) => {
      const [k, v] = pair.split("=");
      params[decode(k)] = decode((v || "").replace(/\+/g, " "));
    });
    return { segments, params };
  }

  function render(keepScroll) {
    try {
      renderRoute(keepScroll);
    } catch (err) {
      console.error(err);
      showFatal("failed to render " + location.hash);
    }
  }

  function renderRoute(keepScroll) {
    const { segments, params } = parseHash();
    const head = segments[0] || "";
    const rest = segments.slice(1).join("/");
    let html;
    let title = "Emporio Armani | Iconic Italian Style US";

    if (!head) html = views.home();
    else if (head === "c") { html = views.listing(rest); title = "Emporio Armani"; }
    else if (head === "p") {
      html = views.pdp(rest);
      const product = C.getProduct(rest);
      if (product) title = product.name + " | Emporio Armani US";
    }
    else if (head === "cart") { html = views.cart(); title = "Shopping bag | Emporio Armani US"; }
    else if (head === "checkout") { html = views.checkout(); title = "Checkout | Emporio Armani US"; }
    else if (head === "wishlist") { html = views.wishlist(); title = "Wishlist | Emporio Armani US"; }
    else if (head === "account") { html = views.account(); title = "My account | Emporio Armani US"; }
    else if (head === "search") { html = views.search(params.q || ""); title = "Search | Emporio Armani US"; }
    else if (head === "stores") { html = views.stores(params.q || ""); title = "Store locator | Emporio Armani US"; }
    else if (head === "track") { html = views.track(segments[1] === "return" ? "return" : "order"); }
    else if (head === "help") { html = views.content(segments.join("/")); }
    else if (head === "legal" || head === "page") { html = views.content(segments.join("/")); }
    else if (head === "brands") { html = views.brandHub(); }
    else if (head === "brand") { html = views.brand(segments[1]); }
    else html = views.notFound();

    document.title = title;
    qs("#view").innerHTML = html;
    renderBadges();
    if (!keepScroll) window.scrollTo(0, 0);
  }

  /* ------------------------------------------------------------------ events */
  // Keeps a failing handler from dying silently: the user gets a toast, the console gets the stack.
  const guard = (label, fn) =>
    function (event) {
      try {
        fn(event);
      } catch (err) {
        console.error("[app] " + label + " handler failed", err);
        toast("Something went wrong. Please try again.");
      }
    };

  document.addEventListener("click", guard("click", function (event) {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;

    switch (action) {
      case "open-cart": openCart(); break;
      case "open-menu": openMenu(); break;
      case "open-search": openSearch(); break;
      case "close-overlay": closeOverlays(); break;
      case "close-after": closeOverlays(); break;

      case "go":
        closeOverlays();
        location.hash = target.dataset.href;
        break;

      case "toggle-group":
        target.parentElement.classList.toggle("open");
        target.querySelector("span").textContent = target.parentElement.classList.contains("open") ? "−" : "+";
        break;

      case "search-term": {
        const input = qs("#search-input");
        if (!input) break;
        input.value = target.dataset.term;
        renderSearchSuggestions(input.value);
        break;
      }

      case "wish":
        S.toggleWishlist(target.dataset.code);
        renderBadges();
        if (parseHash().segments[0] === "wishlist") render(true);
        toast(S.isWishlisted(target.dataset.code) ? "Added to wishlist" : "Removed from wishlist");
        break;

      case "quick-add": {
        const product = C.getByCode(target.dataset.code);
        if (!product || !product.sizes.length) {
          console.error("[app] quick-add for unavailable product", target.dataset.code);
          toast("This item is currently unavailable.");
          break;
        }
        addToCart(product.code, product.sizes[0]);
        break;
      }

      case "pick-size":
        pdpState.size = target.dataset.value;
        pdpState.error = false;
        render(true);
        break;

      case "add-to-cart": {
        if (!pdpState.size) {
          pdpState.error = true;
          render(true);
          break;
        }
        addToCart(target.dataset.code, pdpState.size);
        break;
      }

      case "zoom":
        overlays().innerHTML =
          '<div class="zoom" data-action="close-overlay">' +
          '<button class="close" aria-label="Close zoom">' + ICONS.close + "</button>" +
          '<img src="' + esc(target.dataset.src) + '" alt=""></div>';
        lockScroll(true);
        break;

      case "accordion": {
        const box = target.parentElement;
        box.classList.toggle("open");
        target.querySelector("span").textContent = box.classList.contains("open") ? "−" : "+";
        break;
      }

      case "qty":
        S.updateQuantity(
          target.dataset.code,
          target.dataset.size,
          currentQty(target.dataset.code, target.dataset.size) + Number(target.dataset.delta)
        );
        refreshCartViews();
        break;

      case "remove":
        S.removeFromCart(target.dataset.code, target.dataset.size);
        refreshCartViews();
        break;

      case "toggle-filters":
        listingState.open = !listingState.open;
        render(true);
        break;

      case "sort":
        listingState.sort = target.dataset.value;
        listingState.shown = 12;
        render(true);
        break;

      case "filter-size":
        toggleIn(listingState.sizes, target.dataset.value);
        listingState.shown = 12;
        render(true);
        break;

      case "filter-color":
        toggleIn(listingState.colors, target.dataset.value);
        listingState.shown = 12;
        render(true);
        break;

      case "filter-sale":
        listingState.saleOnly = !listingState.saleOnly;
        listingState.shown = 12;
        render(true);
        break;

      case "clear-filters":
        listingState.sizes = [];
        listingState.colors = [];
        listingState.saleOnly = false;
        listingState.shown = 12;
        render(true);
        break;

      case "show-more":
        listingState.shown += 12;
        render(true);
        break;

      case "back-to-address":
        checkoutState.step = "address";
        render(true);
        break;

      case "sign-out":
        S.signOut();
        render(true);
        break;

      default:
        break;
    }
  }));

  document.addEventListener("submit", guard("submit", function (event) {
    const form = event.target.closest("[data-action]");
    if (!form) return;
    event.preventDefault();
    const data = new FormData(form);

    switch (form.dataset.action) {
      case "newsletter": {
        const msg = qs("#newsletter-msg");
        if (msg) msg.textContent = "Thank you for subscribing. Check your inbox to confirm.";
        form.reset();
        break;
      }

      case "checkout-address":
        checkoutState.address = {
          firstName: data.get("firstName"),
          lastName: data.get("lastName"),
          email: data.get("email"),
          address: data.get("address"),
          city: data.get("city"),
          state: data.get("state"),
          zip: data.get("zip"),
          country: data.get("country"),
        };
        checkoutState.step = "payment";
        render(true);
        break;

      case "checkout-payment":
        try {
          checkoutState.order = S.placeOrder(checkoutState.address);
        } catch (err) {
          console.error("[app] order could not be placed", err);
          toast("We could not place your order. Please check your details and try again.");
          checkoutState.step = "address";
          render(true);
          break;
        }
        checkoutState.step = "address";
        renderBadges();
        render();
        break;

      case "sign-in": {
        const email = String(data.get("email") || "").trim();
        if (!email) {
          toast("Please enter your email address.");
          break;
        }
        S.signIn({ email: email, firstName: email.split("@")[0], lastName: "" });
        render(true);
        break;
      }

      case "track": {
        const order = S.findOrder(data.get("reference"));
        const kind = form.dataset.kind;
        const result = qs("#track-result");
        if (!result) break;
        result.textContent = order
          ? kind === "return"
            ? "No return has been requested for order " + order.id + " yet. Returns are free within 14 days."
            : "Order " + order.id + " — " + order.status + ". Estimated delivery within 4/6 business days."
          : 'We could not find a ' + (kind === "return" ? "return" : "order") + ' with reference "' + data.get("reference") + '".';
        break;
      }

      default:
        break;
    }
  }));

  document.addEventListener("input", guard("input", function (event) {
    if (event.target.id === "store-search") {
      const value = event.target.value;
      qs("#view").innerHTML = views.stores(value);
      const input = qs("#store-search");
      input.focus();
      input.setSelectionRange(value.length, value.length);
    }
  }));

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeOverlays();
  });

  function toggleIn(list, value) {
    const index = list.indexOf(value);
    if (index === -1) list.push(value);
    else list.splice(index, 1);
  }

  function addToCart(code, size) {
    try {
      S.addToCart(code, size, 1);
    } catch (err) {
      console.error("[app] add to cart failed", err);
      toast("This item could not be added to your bag.");
      return;
    }
    renderBadges();
    openCart();
  }

  function currentQty(code, size) {
    const line = S.cart.find((l) => l.code === code && l.size === size);
    return line ? line.quantity : 0;
  }

  function refreshCartViews() {
    renderBadges();
    const head = parseHash().segments[0];
    if (head === "cart" || head === "checkout") render(true);
    if (qs(".drawer-right")) openCart();
  }

  /* -------------------------------------------------------------------- boot */
  window.addEventListener("error", (event) => console.error("[app] uncaught error", event.error || event.message));
  window.addEventListener("unhandledrejection", (event) => console.error("[app] unhandled rejection", event.reason));

  S.onError((message) => toast(message));

  try {
    renderHeader();
    renderFooter();
  } catch (err) {
    console.error(err);
    showFatal("failed to render the page chrome");
    return;
  }

  window.addEventListener("hashchange", function () {
    closeOverlays();
    if (parseHash().segments[0] !== "checkout") checkoutState.order = null;
    render();
  });
  render();
})();
