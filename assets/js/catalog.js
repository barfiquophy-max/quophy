// Catalog access helpers over window.CATALOG (assets/js/data.js).
(function () {
  const products = window.CATALOG.products;
  const categories = window.CATALOG.categories;
  const home = window.CATALOG.home;

  const byCode = new Map(products.map((p) => [p.code, p]));
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const catBySlug = new Map(categories.map((c) => [c.slug, c]));

  const priceOf = (p) => (p.salePrice != null ? p.salePrice : p.price);
  const formatPrice = (v) =>
    "$ " + Number(v).toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 });

  const styleKey = (p) => p.code.split("_").slice(0, 2).join("_");

  const uniqueByCode = (list) => {
    const seen = new Set();
    const out = [];
    for (const p of list) {
      if (!seen.has(p.code)) {
        seen.add(p.code);
        out.push(p);
      }
    }
    return out;
  };

  const Catalog = {
    products,
    categories,
    home,
    priceOf,
    formatPrice,
    getProduct: (slug) => bySlug.get(slug) || null,
    getByCode: (code) => byCode.get(code) || null,
    getCategory: (slug) => catBySlug.get(slug) || null,

    // Products for an exact category slug, in the order the live site listed them.
    categoryProducts(slug) {
      const cat = catBySlug.get(slug);
      if (!cat) return [];
      return cat.productCodes.map((c) => byCode.get(c)).filter(Boolean);
    },

    // Products for any path: exact category, or every descendant category.
    listing(path) {
      const exact = this.categoryProducts(path);
      if (exact.length) return exact;
      const children = categories.filter((c) => c.slug === path || c.slug.startsWith(path + "/"));
      return uniqueByCode(children.flatMap((c) => this.categoryProducts(c.slug)));
    },

    childCategories: (path) => categories.filter((c) => c.slug.startsWith(path + "/")),

    saleProducts: (gender) =>
      products.filter((p) => p.salePrice != null && (!gender || p.gender === gender)),

    newArrivals: (gender) =>
      products.filter((p) => p.newSeason && (!gender || p.gender === gender)),

    colorVariants(product) {
      const key = styleKey(product);
      return products.filter((p) => styleKey(p) === key);
    },

    related(product, limit) {
      const cat = product.categories[0];
      const pool = cat ? this.categoryProducts(cat) : [];
      return pool.filter((p) => p.code !== product.code).slice(0, limit || 8);
    },

    search(query, limit) {
      const q = String(query || "").trim().toLowerCase();
      if (!q) return [];
      const terms = q.split(/\s+/);
      const scored = [];
      for (const p of products) {
        const haystack = (p.name + " " + p.color + " " + (p.sub || "") + " " + (p.group || "")).toLowerCase();
        if (terms.every((t) => haystack.includes(t))) {
          scored.push([p.name.toLowerCase().startsWith(terms[0]) ? 0 : 1, p]);
        }
      }
      scored.sort((a, b) => a[0] - b[0]);
      return scored.slice(0, limit || 200).map((s) => s[1]);
    },
  };

  window.Catalog = Catalog;
})();
