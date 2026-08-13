// Cart / wishlist / orders / account state, persisted to localStorage.
(function () {
  const KEYS = { cart: "ea-cart", wishlist: "ea-wishlist", orders: "ea-orders", account: "ea-account" };

  const listeners = [];
  const errorListeners = [];

  // Surfaced to the UI (a toast) as well as the console, so failures are never invisible.
  const report = (message, err) => {
    console.error("[store] " + message, err);
    errorListeners.forEach((fn) => {
      try {
        fn(message, err);
      } catch (listenerErr) {
        console.error("[store] error listener failed", listenerErr);
      }
    });
  };

  const isCart = (v) =>
    Array.isArray(v) &&
    v.every((l) => l && typeof l.code === "string" && typeof l.quantity === "number" && l.quantity > 0);
  const isWishlist = (v) => Array.isArray(v) && v.every((c) => typeof c === "string");
  const isOrders = (v) => Array.isArray(v) && v.every((o) => o && typeof o.id === "string" && Array.isArray(o.lines));
  const isAccount = (v) => v === null || (typeof v === "object" && typeof v.email === "string");

  const read = (key, fallback, isValid) => {
    let raw;
    try {
      raw = localStorage.getItem(key);
    } catch (err) {
      report("Stored data could not be read; this session will not be saved.", err);
      return fallback;
    }
    if (!raw) return fallback;

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      report("Saved " + key + " was corrupted and has been reset.", err);
      remove(key);
      return fallback;
    }
    if (!isValid(parsed)) {
      report("Saved " + key + " had an unexpected shape and has been reset.", parsed);
      remove(key);
      return fallback;
    }
    return parsed;
  };

  const remove = (key) => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error("[store] could not clear " + key, err);
    }
  };

  // Returns whether the value was persisted so callers can react to a failed save.
  const write = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      report("Your changes could not be saved and will be lost when you leave the page.", err);
      return false;
    }
  };

  const Store = {
    cart: read(KEYS.cart, [], isCart),
    wishlist: read(KEYS.wishlist, [], isWishlist),
    orders: read(KEYS.orders, [], isOrders),
    account: read(KEYS.account, null, isAccount),

    subscribe(fn) {
      listeners.push(fn);
    },
    // Notified when state cannot be read or persisted.
    onError(fn) {
      errorListeners.push(fn);
    },
    emit() {
      listeners.forEach((fn) => {
        try {
          fn();
        } catch (err) {
          console.error("[store] subscriber failed", err);
        }
      });
    },

    cartCount() {
      return this.cart.reduce((sum, line) => sum + line.quantity, 0);
    },
    cartLines() {
      const entries = this.cart.map((line) => ({ line: line, product: window.Catalog.getByCode(line.code) }));
      const missing = entries.filter((entry) => !entry.product);
      if (missing.length) {
        report(
          missing.length + " item(s) in your bag are no longer available and were removed.",
          missing.map((entry) => entry.line.code)
        );
        this.cart = this.cart.filter((line) => window.Catalog.getByCode(line.code));
        write(KEYS.cart, this.cart);
      }
      return entries.filter((entry) => entry.product);
    },
    subtotal() {
      return this.cartLines().reduce(
        (sum, e) => sum + window.Catalog.priceOf(e.product) * e.line.quantity,
        0
      );
    },
    shipping() {
      const sub = this.subtotal();
      return sub === 0 || sub > 250 ? 0 : 15;
    },
    total() {
      return this.subtotal() + this.shipping();
    },

    addToCart(code, size, quantity) {
      if (!window.Catalog.getByCode(code)) throw new Error("Unknown product code: " + code);
      const qty = quantity || 1;
      const existing = this.cart.find((l) => l.code === code && l.size === size);
      if (existing) existing.quantity += qty;
      else this.cart.push({ code: code, size: size, quantity: qty });
      write(KEYS.cart, this.cart);
      this.emit();
    },
    updateQuantity(code, size, quantity) {
      if (quantity < 1) return this.removeFromCart(code, size);
      const line = this.cart.find((l) => l.code === code && l.size === size);
      if (line) line.quantity = quantity;
      write(KEYS.cart, this.cart);
      this.emit();
    },
    removeFromCart(code, size) {
      this.cart = this.cart.filter((l) => !(l.code === code && l.size === size));
      write(KEYS.cart, this.cart);
      this.emit();
    },
    clearCart() {
      this.cart = [];
      write(KEYS.cart, this.cart);
      this.emit();
    },

    isWishlisted(code) {
      return this.wishlist.indexOf(code) !== -1;
    },
    toggleWishlist(code) {
      if (this.isWishlisted(code)) this.wishlist = this.wishlist.filter((c) => c !== code);
      else this.wishlist = this.wishlist.concat(code);
      write(KEYS.wishlist, this.wishlist);
      this.emit();
    },

    placeOrder(address) {
      const lines = this.cartLines();
      if (!lines.length) throw new Error("Cannot place an order with an empty bag");
      if (!address || !address.email) throw new Error("Cannot place an order without a shipping address");
      const order = {
        id: "EA" + String(Date.now()).slice(-8),
        createdAt: new Date().toISOString(),
        status: "Confirmed",
        total: this.total(),
        address: address,
        lines: lines.map((e) => ({
          code: e.product.code,
          name: e.product.name,
          size: e.line.size,
          quantity: e.line.quantity,
          price: window.Catalog.priceOf(e.product),
          color: e.product.color,
          image: e.product.images[0],
        })),
      };
      this.orders = [order].concat(this.orders);
      write(KEYS.orders, this.orders);
      this.clearCart();
      return order;
    },
    findOrder(id) {
      const needle = String(id || "").trim().toLowerCase();
      return this.orders.find((o) => o.id.toLowerCase() === needle) || null;
    },

    signIn(account) {
      this.account = account;
      write(KEYS.account, account);
      this.emit();
    },
    signOut() {
      this.account = null;
      write(KEYS.account, null);
      this.emit();
    },
  };

  window.Store = Store;
})();
