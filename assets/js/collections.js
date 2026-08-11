/* QUOPHY — product listing page: filtering, sorting, URL state */

const PRICE_BANDS = {
  "0-1000": [0, 1000],
  "1000-2500": [1000, 2500],
  "2500-99999": [2500, Infinity],
};

const state = {
  categories: [],
  genders: [],
  prices: [],
  sort: "recommended",
};

function readUrlState() {
  const params = new URLSearchParams(location.search);
  state.categories = params.getAll("category").filter((c) => CATEGORIES.some((x) => x.slug === c));
  state.genders = params.getAll("gender").filter((g) => ["women", "men"].includes(g));
  state.prices = params.getAll("price").filter((p) => p in PRICE_BANDS);
  const sort = params.get("sort");
  state.sort = ["recommended", "new", "price-asc", "price-desc"].includes(sort) ? sort : "recommended";
}

function writeUrlState(replace = true) {
  const params = new URLSearchParams();
  state.categories.forEach((c) => params.append("category", c));
  state.genders.forEach((g) => params.append("gender", g));
  state.prices.forEach((p) => params.append("price", p));
  if (state.sort !== "recommended") params.set("sort", state.sort);
  const url = params.toString() ? `?${params}` : location.pathname;
  history[replace ? "replaceState" : "pushState"](null, "", url);
}

function matches(product) {
  if (state.categories.length && !state.categories.includes(product.category)) return false;
  if (state.genders.length && !state.genders.includes(product.gender)) return false;
  if (state.prices.length) {
    const inBand = state.prices.some((band) => {
      const [min, max] = PRICE_BANDS[band];
      return product.price >= min && product.price < max;
    });
    if (!inBand) return false;
  }
  return true;
}

function sortProducts(list) {
  const sorted = [...list];
  switch (state.sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "new":
      return sorted.sort((a, b) => Number(Boolean(b.badge)) - Number(Boolean(a.badge)));
    default:
      return sorted;
  }
}

function paintHeading() {
  const category = state.categories.length === 1 ? CATEGORIES.find((c) => c.slug === state.categories[0]) : null;
  const gender = state.genders.length === 1 ? state.genders[0] : null;

  let title = "The Collection";
  if (category && gender) title = `${category.label} for ${gender === "women" ? "Women" : "Men"}`;
  else if (category) title = category.label;
  else if (gender) title = gender === "women" ? "Women" : "Men";
  else if (state.sort === "new") title = "New In";

  $("[data-plp-title]").textContent = title;
  $("[data-plp-blurb]").textContent = category
    ? category.blurb
    : "Pieces from the Primavera collection, hand-finished in the Quophy ateliers.";
  document.title = `${title} | QUOPHY`;

  const crumbs = ['<li><a href="index.html">Home</a></li>'];
  if (gender) crumbs.push(`<li><a href="collections.html?gender=${gender}">${gender === "women" ? "Women" : "Men"}</a></li>`);
  crumbs.push(`<li>${escapeHtml(title)}</li>`);
  $("[data-breadcrumbs]").innerHTML = crumbs.join("");
}

function paintSubnav() {
  const gender = state.genders.length === 1 ? `&gender=${state.genders[0]}` : "";
  const all = `collections.html${gender ? `?${gender.slice(1)}` : ""}`;
  const links = [{ label: "All", href: all, slug: "" }].concat(
    CATEGORIES.map((c) => ({ label: c.label, href: `collections.html?category=${c.slug}${gender}`, slug: c.slug }))
  );
  $("[data-subnav]").innerHTML = links
    .map((l) => {
      const active = l.slug ? state.categories.includes(l.slug) : state.categories.length === 0;
      return `<a href="${l.href}" class="${active ? "is-active" : ""}">${escapeHtml(l.label)}</a>`;
    })
    .join("");
}

function paintChips() {
  const chips = [
    ...state.categories.map((c) => ({ type: "category", value: c, label: CATEGORIES.find((x) => x.slug === c).label })),
    ...state.genders.map((g) => ({ type: "gender", value: g, label: g === "women" ? "Women" : "Men" })),
    ...state.prices.map((p) => ({
      type: "price",
      value: p,
      label: p === "2500-99999" ? "Over $2,500" : `$${PRICE_BANDS[p][0].toLocaleString()} – $${PRICE_BANDS[p][1].toLocaleString()}`,
    })),
  ];
  $("[data-chips]").innerHTML = chips
    .map(
      (chip) => `<li><button class="chip" data-remove-chip data-type="${chip.type}" data-value="${chip.value}">
        ${escapeHtml(chip.label)} <span aria-hidden="true">×</span>
        <span class="visually-hidden">Remove filter</span>
      </button></li>`
    )
    .join("");
}

function paintGrid() {
  const list = sortProducts(PRODUCTS.filter(matches));
  $("[data-plp-grid]").innerHTML = list.map((p, i) => productCard(p, { eager: i < 4 })).join("");
  $$("[data-plp-count]").forEach((el) => (el.textContent = list.length));
  $("[data-plp-empty]").hidden = list.length > 0;
  observeReveals();
}

function syncForm() {
  const form = $("[data-filters]");
  $$('input[name="sort"]', form).forEach((input) => (input.checked = input.value === state.sort));
  $$('input[name="category"]', form).forEach((input) => (input.checked = state.categories.includes(input.value)));
  $$('input[name="gender"]', form).forEach((input) => (input.checked = state.genders.includes(input.value)));
  $$('input[name="price"]', form).forEach((input) => (input.checked = state.prices.includes(input.value)));
}

function render() {
  paintHeading();
  paintSubnav();
  paintChips();
  paintGrid();
  syncForm();
}

document.addEventListener("DOMContentLoaded", () => {
  $("[data-filter-categories]").innerHTML = CATEGORIES.map(
    (c) => `<label class="filters__opt"><input type="checkbox" name="category" value="${c.slug}"> ${escapeHtml(c.label)}</label>`
  ).join("");

  readUrlState();
  render();

  $("[data-filters]").addEventListener("change", (event) => {
    const form = event.currentTarget;
    state.sort = new FormData(form).get("sort") || "recommended";
    state.categories = $$('input[name="category"]:checked', form).map((i) => i.value);
    state.genders = $$('input[name="gender"]:checked', form).map((i) => i.value);
    state.prices = $$('input[name="price"]:checked', form).map((i) => i.value);
    writeUrlState();
    render();
  });

  document.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-remove-chip]");
    if (chip) {
      const key = { category: "categories", gender: "genders", price: "prices" }[chip.dataset.type];
      state[key] = state[key].filter((v) => v !== chip.dataset.value);
      writeUrlState();
      render();
      return;
    }
    if (event.target.closest("[data-clear-filters]")) {
      state.categories = [];
      state.genders = [];
      state.prices = [];
      state.sort = "recommended";
      writeUrlState();
      render();
    }
  });

  window.addEventListener("popstate", () => {
    readUrlState();
    render();
  });
});
