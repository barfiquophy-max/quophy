// Integration coverage for the application shell: boot, routing, views and actions.
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

let Catalog;
let Store;

function goto(hash) {
  location.hash = hash;
  window.dispatchEvent(new window.HashChangeEvent("hashchange"));
}

const view = () => document.querySelector("#view");
const click = (el) => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

beforeAll(async () => {
  document.body.innerHTML =
    '<div id="header"></div><main id="view"></main><div id="footer"></div><div id="overlays"></div>';
  window.scrollTo = () => {};
  location.hash = "";
  await import("../assets/js/data.js");
  await import("../assets/js/content.js");
  await import("../assets/js/catalog.js");
  await import("../assets/js/store.js");
  Catalog = window.Catalog;
  Store = window.Store;
  await import("../assets/js/app.js");
});

beforeEach(() => {
  Store.clearCart();
  Store.wishlist = [];
  Store.signOut();
  goto("");
});

describe("boot", () => {
  it("renders the header, footer and home view", () => {
    expect(document.querySelector("#header .megamenu")).toBeTruthy();
    expect(document.querySelector("#footer")).not.toBeNull();
    expect(document.querySelector("#footer").textContent).toContain("Copyright");
    expect(view().innerHTML.length).toBeGreaterThan(0);
  });

  it("hides the cart and wishlist badges while both are empty", () => {
    expect(document.querySelector("#cart-badge").classList.contains("hidden")).toBe(true);
    expect(document.querySelector("#wish-badge").classList.contains("hidden")).toBe(true);
  });
});

describe("routing", () => {
  it("renders a category listing with product tiles", () => {
    goto("#/c/man/clothing/shirts");
    expect(view().querySelectorAll(".tile").length).toBeGreaterThan(0);
    expect(view().querySelector("#plp-count").textContent).toMatch(/items$/);
  });

  it("renders a product page and sets the document title", () => {
    const product = Catalog.products[0];
    goto("#/p/" + product.slug);
    expect(document.title).toBe(product.name + " | Emporio Armani US");
    expect(view().textContent).toContain(product.name);
  });

  it("renders the sale listing", () => {
    goto("#/c/sale/man");
    expect(view().textContent).toContain("Sale");
    expect(view().querySelectorAll(".tile").length).toBeGreaterThan(0);
  });

  it("renders search results for a query parameter", () => {
    goto("#/search?q=shirt");
    expect(document.title).toBe("Search | Emporio Armani US");
    expect(view().querySelectorAll(".tile").length).toBeGreaterThan(0);
  });

  it("decodes multi-word query parameters", () => {
    goto("#/search?q=poplin+shirt");
    expect(view().querySelectorAll(".tile").length).toBeGreaterThan(0);
  });

  it("renders the store locator, wishlist, account and tracking views", () => {
    goto("#/stores");
    expect(document.title).toBe("Store locator | Emporio Armani US");
    expect(view().querySelector("#store-search")).toBeTruthy();

    goto("#/wishlist");
    expect(document.title).toBe("Wishlist | Emporio Armani US");

    goto("#/account");
    expect(document.title).toBe("My account | Emporio Armani US");

    goto("#/track/return");
    expect(view().querySelector("#track-result")).toBeTruthy();
  });

  it("falls back to the not-found view for unknown routes and categories", () => {
    goto("#/nowhere");
    expect(view().textContent.toLowerCase()).toContain("not");
    goto("#/c/man/does-not-exist");
    expect(view().querySelectorAll(".tile").length).toBe(0);
  });
});

describe("cart interactions", () => {
  it("quick-adds a tile to the cart, updates the badge and opens the drawer", () => {
    goto("#/c/man/clothing/shirts");
    click(view().querySelector("[data-action='quick-add']"));
    expect(Store.cartCount()).toBe(1);
    expect(document.querySelector("#cart-badge").textContent).toBe("1");
    expect(document.querySelector("#cart-badge").classList.contains("hidden")).toBe(false);
    expect(document.querySelector(".drawer-right")).toBeTruthy();
  });

  it("requires a size before adding from the product page", () => {
    const product = Catalog.products[0];
    goto("#/p/" + product.slug);
    click(view().querySelector("[data-action='add-to-cart']"));
    expect(Store.cartCount()).toBe(0);

    click(view().querySelector("[data-action='pick-size']"));
    click(view().querySelector("[data-action='add-to-cart']"));
    expect(Store.cartCount()).toBe(1);
    expect(Store.cart[0].size).toBe(product.sizes[0]);
  });

  it("changes quantities and removes lines from the cart page", () => {
    const product = Catalog.products[0];
    Store.addToCart(product.code, product.sizes[0], 1);
    goto("#/cart");
    expect(document.title).toBe("Shopping bag | Emporio Armani US");

    const plus = view().querySelector("[data-action='qty'][data-delta='1']");
    click(plus);
    expect(Store.cartCount()).toBe(2);

    click(view().querySelector("[data-action='remove']"));
    expect(Store.cart).toEqual([]);
    expect(document.querySelector("#cart-badge").classList.contains("hidden")).toBe(true);
  });
});

describe("wishlist interactions", () => {
  it("toggles a product from a listing tile and reflects it in the badge", () => {
    goto("#/c/man/clothing/shirts");
    const button = view().querySelector("[data-action='wish']");
    const code = button.dataset.code;
    click(button);
    expect(Store.isWishlisted(code)).toBe(true);
    expect(document.querySelector("#wish-badge").textContent).toBe("1");

    goto("#/wishlist");
    expect(view().querySelectorAll(".tile").length).toBe(1);
    click(view().querySelector("[data-action='wish']"));
    expect(Store.wishlist).toEqual([]);
    expect(view().querySelectorAll(".tile").length).toBe(0);
  });
});

describe("listing filters and sorting", () => {
  beforeEach(() => goto("#/c/man/clothing/shirts"));

  it("sorts by price ascending", () => {
    click(view().querySelector("[data-action='sort'][data-value='price-asc']"));
    const prices = Array.from(view().querySelectorAll(".tile")).map((tile) =>
      Catalog.priceOf(Catalog.getByCode(tile.dataset.code))
    );
    expect(prices).toEqual(prices.slice().sort((a, b) => a - b));
  });

  it("narrows results with the sale-only filter and clears it again", () => {
    const before = view().querySelectorAll(".tile").length;
    click(view().querySelector("[data-action='filter-sale']"));
    const filtered = Array.from(view().querySelectorAll(".tile"));
    expect(filtered.every((t) => Catalog.getByCode(t.dataset.code).salePrice != null)).toBe(true);
    expect(view().querySelector("[data-action='clear-filters']")).toBeTruthy();

    click(view().querySelector("[data-action='clear-filters']"));
    expect(view().querySelectorAll(".tile").length).toBe(before);
  });

  it("pages in more products with show more", () => {
    const before = view().querySelectorAll(".tile").length;
    const more = view().querySelector("[data-action='show-more']");
    if (!more) return;
    click(more);
    expect(view().querySelectorAll(".tile").length).toBeGreaterThan(before);
  });
});

describe("overlays", () => {
  it("opens and closes the search overlay, and suggests products", () => {
    click(document.querySelector("[data-action='open-search']"));
    const input = document.querySelector("#search-input");
    expect(input).toBeTruthy();

    input.value = "shirt";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    expect(document.querySelector("#search-body").querySelectorAll(".tile").length).toBeGreaterThan(0);

    document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(document.querySelector("#overlays").innerHTML).toBe("");
  });

  it("opens the navigation menu overlay", () => {
    click(document.querySelector("[data-action='open-menu']"));
    expect(document.querySelector("#overlays").innerHTML.length).toBeGreaterThan(0);
    click(document.querySelector("[data-action='close-overlay']"));
    expect(document.querySelector("#overlays").innerHTML).toBe("");
  });

  it("opens the cart drawer from the header", () => {
    click(document.querySelector("[data-action='open-cart']"));
    expect(document.querySelector(".drawer-right")).toBeTruthy();
  });
});

describe("checkout", () => {
  const fill = (form, values) =>
    Object.entries(values).forEach(([name, value]) => {
      form.querySelector("[name='" + name + "']").value = value;
    });
  const submit = (form) =>
    form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));

  it("tells the shopper the bag is empty", () => {
    goto("#/checkout");
    expect(view().textContent).toContain("Your shopping bag is empty.");
  });

  it("walks shipping -> payment -> confirmation and empties the cart", () => {
    const product = Catalog.products[0];
    Store.addToCart(product.code, product.sizes[0], 1);
    goto("#/checkout");

    const address = view().querySelector("form[data-action='checkout-address']");
    fill(address, {
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      address: "1 Via Roma",
      city: "Milan",
      state: "MI",
      zip: "20121",
      country: "Italy",
    });
    submit(address);

    const payment = view().querySelector("form[data-action='checkout-payment']");
    expect(payment).toBeTruthy();
    submit(payment);

    expect(view().querySelector("#order-confirmation").textContent).toContain("ada@example.com");
    expect(Store.cart).toEqual([]);
    expect(Store.orders.length).toBeGreaterThan(0);
  });
});

describe("account", () => {
  it("signs in from the account form and signs out again", () => {
    goto("#/account");
    const form = view().querySelector("form[data-action='sign-in']");
    form.querySelector("[name='email']").value = "ada@example.com";
    form.querySelector("[name='password']").value = "secret";
    form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));

    expect(Store.account.email).toBe("ada@example.com");
    expect(view().textContent).toContain("Hello, ada");

    click(view().querySelector("[data-action='sign-out']"));
    expect(Store.account).toBeNull();
    expect(view().querySelector("form[data-action='sign-in']")).toBeTruthy();
  });
});

describe("order tracking", () => {
  it("reports a known order and rejects an unknown reference", () => {
    const product = Catalog.products[0];
    Store.addToCart(product.code, product.sizes[0], 1);
    const order = Store.placeOrder({ name: "Test" });

    goto("#/track");
    const form = view().querySelector("form[data-action='track']");
    form.querySelector("[name='reference']").value = order.id;
    form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
    expect(view().querySelector("#track-result").textContent).toContain(order.id);

    form.querySelector("[name='reference']").value = "EA-unknown";
    form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
    expect(view().querySelector("#track-result").textContent).toContain("could not find");
  });
});
