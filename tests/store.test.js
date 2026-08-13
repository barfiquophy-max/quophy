import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeCatalog } from "./fixtures/catalog.js";

let Store;

async function loadStore() {
  vi.resetModules();
  window.CATALOG = makeCatalog();
  await import("../assets/js/catalog.js");
  await import("../assets/js/store.js");
  Store = window.Store;
}

beforeEach(async () => {
  localStorage.clear();
  await loadStore();
});

describe("persistence", () => {
  it("starts empty and writes the cart to localStorage", async () => {
    expect(Store.cart).toEqual([]);
    Store.addToCart("AAA_111_100", "M", 2);
    expect(JSON.parse(localStorage.getItem("ea-cart"))).toEqual([
      { code: "AAA_111_100", size: "M", quantity: 2 },
    ]);
  });

  it("rehydrates state from localStorage on load", async () => {
    Store.addToCart("AAA_111_100", "M", 1);
    Store.toggleWishlist("BBB_222_100");
    Store.signIn({ email: "a@b.com" });
    await loadStore();
    expect(Store.cart).toEqual([{ code: "AAA_111_100", size: "M", quantity: 1 }]);
    expect(Store.wishlist).toEqual(["BBB_222_100"]);
    expect(Store.account).toEqual({ email: "a@b.com" });
  });

  it("falls back to defaults when stored JSON is corrupt", async () => {
    localStorage.setItem("ea-cart", "{not json");
    await loadStore();
    expect(Store.cart).toEqual([]);
  });
});

describe("cart mutations", () => {
  it("merges quantities for the same code and size", () => {
    Store.addToCart("AAA_111_100", "M", 1);
    Store.addToCart("AAA_111_100", "M");
    expect(Store.cart).toEqual([{ code: "AAA_111_100", size: "M", quantity: 2 }]);
  });

  it("keeps separate lines per size", () => {
    Store.addToCart("AAA_111_100", "M", 1);
    Store.addToCart("AAA_111_100", "L", 1);
    expect(Store.cart.length).toBe(2);
    expect(Store.cartCount()).toBe(2);
  });

  it("updates a line quantity", () => {
    Store.addToCart("AAA_111_100", "M", 1);
    Store.updateQuantity("AAA_111_100", "M", 5);
    expect(Store.cartCount()).toBe(5);
  });

  it("removes the line when the quantity drops below one", () => {
    Store.addToCart("AAA_111_100", "M", 3);
    Store.updateQuantity("AAA_111_100", "M", 0);
    expect(Store.cart).toEqual([]);
  });

  it("ignores updates for lines that are not in the cart", () => {
    Store.updateQuantity("AAA_111_100", "M", 4);
    expect(Store.cart).toEqual([]);
  });

  it("removes and clears lines", () => {
    Store.addToCart("AAA_111_100", "M", 1);
    Store.addToCart("BBB_222_100", "S", 1);
    Store.removeFromCart("AAA_111_100", "M");
    expect(Store.cart.map((l) => l.code)).toEqual(["BBB_222_100"]);
    Store.clearCart();
    expect(Store.cart).toEqual([]);
  });
});

describe("cart totals", () => {
  it("drops lines whose product no longer exists", () => {
    Store.addToCart("GONE_000_000", "M", 1);
    expect(Store.cartLines()).toEqual([]);
    expect(Store.subtotal()).toBe(0);
  });

  it("uses sale prices in the subtotal", () => {
    Store.addToCart("BBB_222_100", "M", 2);
    expect(Store.subtotal()).toBe(240);
  });

  it("charges flat shipping below the free-shipping threshold", () => {
    Store.addToCart("BBB_222_100", "M", 1);
    expect(Store.shipping()).toBe(15);
    expect(Store.total()).toBe(135);
  });

  it("ships free on an empty cart and above the threshold", () => {
    expect(Store.shipping()).toBe(0);
    Store.addToCart("AAA_111_100", "M", 1);
    expect(Store.shipping()).toBe(0);
    expect(Store.total()).toBe(300);
  });
});

describe("wishlist", () => {
  it("toggles codes on and off", () => {
    expect(Store.isWishlisted("AAA_111_100")).toBe(false);
    Store.toggleWishlist("AAA_111_100");
    expect(Store.isWishlisted("AAA_111_100")).toBe(true);
    Store.toggleWishlist("AAA_111_100");
    expect(Store.wishlist).toEqual([]);
  });
});

describe("orders", () => {
  it("snapshots the cart into an order and empties the cart", () => {
    Store.addToCart("BBB_222_100", "M", 2);
    const order = Store.placeOrder({ city: "Milan" });
    expect(order.status).toBe("Confirmed");
    expect(order.total).toBe(255);
    expect(order.address).toEqual({ city: "Milan" });
    expect(order.lines).toEqual([
      {
        code: "BBB_222_100",
        name: "Cotton t-shirt",
        size: "M",
        quantity: 2,
        price: 120,
        color: "White",
        image: "a.jpg",
      },
    ]);
    expect(Store.cart).toEqual([]);
    expect(Store.orders[0]).toBe(order);
  });

  it("keeps the newest order first", () => {
    Store.addToCart("AAA_111_100", "M", 1);
    const first = Store.placeOrder({});
    Store.addToCart("AAA_111_100", "M", 1);
    const second = Store.placeOrder({});
    expect(Store.orders.map((o) => o.id)[0]).toBe(second.id);
    expect(Store.orders.length).toBe(2);
    expect(first.id).toBeTruthy();
  });

  it("finds orders by reference, case- and space-insensitively", () => {
    Store.addToCart("AAA_111_100", "M", 1);
    const order = Store.placeOrder({});
    expect(Store.findOrder("  " + order.id.toLowerCase() + " ")).toBe(order);
    expect(Store.findOrder("EA00000000")).toBeNull();
    expect(Store.findOrder(null)).toBeNull();
  });
});

describe("account and subscribers", () => {
  it("signs in and out", () => {
    Store.signIn({ email: "a@b.com" });
    expect(Store.account.email).toBe("a@b.com");
    Store.signOut();
    expect(Store.account).toBeNull();
    expect(localStorage.getItem("ea-account")).toBe("null");
  });

  it("notifies subscribers on every mutation", () => {
    const spy = vi.fn();
    Store.subscribe(spy);
    Store.addToCart("AAA_111_100", "M", 1);
    Store.toggleWishlist("AAA_111_100");
    Store.signOut();
    expect(spy).toHaveBeenCalledTimes(3);
  });
});
