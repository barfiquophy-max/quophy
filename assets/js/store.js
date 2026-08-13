// Cart / wishlist / orders / account state, persisted to localStorage.
(function () {
  const KEYS = { cart: "ea-cart", wishlist: "ea-wishlist", orders: "ea-orders", account: "ea-account" };

  const read = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  };
  const write = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      /* storage unavailable (private mode / file://) */
    }
  };

  const MAX_QUANTITY = 99;

  const text = (value) => (typeof value === "string" ? value.slice(0, 200) : "");
  const quantity = (value) => {
    const n = Math.floor(Number(value));
    if (!Number.isFinite(n) || n < 1) return 1;
    return Math.min(n, MAX_QUANTITY);
  };

  // Persisted state is attacker-controllable (another script on the origin, a
  // shared browser, devtools), so it is re-validated before it reaches the DOM.
  const cleanCart = (value) =>
    (Array.isArray(value) ? value : [])
      .filter((line) => line && typeof line === "object" && typeof line.code === "string")
      .map((line) => ({ code: text(line.code), size: text(line.size), quantity: quantity(line.quantity) }));

  const cleanWishlist = (value) =>
    (Array.isArray(value) ? value : []).filter((code) => typeof code === "string").map(text);

  const cleanOrders = (value) =>
    (Array.isArray(value) ? value : []).filter(
      (order) => order && typeof order === "object" && typeof order.id === "string" && Array.isArray(order.lines)
    );

  const cleanAccount = (value) =>
    value && typeof value === "object"
      ? { email: text(value.email), firstName: text(value.firstName), lastName: text(value.lastName) }
      : null;

  const listeners = [];

  const Store = {
    cart: cleanCart(read(KEYS.cart, [])),
    wishlist: cleanWishlist(read(KEYS.wishlist, [])),
    orders: cleanOrders(read(KEYS.orders, [])),
    account: cleanAccount(read(KEYS.account, null)),

    subscribe(fn) {
      listeners.push(fn);
    },
    emit() {
      listeners.forEach((fn) => fn());
    },

    cartCount() {
      return this.cart.reduce((sum, line) => sum + line.quantity, 0);
    },
    cartLines() {
      return this.cart
        .map((line) => ({ line: line, product: window.Catalog.getByCode(line.code) }))
        .filter((entry) => entry.product);
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

    addToCart(code, size, qty) {
      const amount = quantity(qty);
      const existing = this.cart.find((l) => l.code === code && l.size === size);
      if (existing) existing.quantity = quantity(existing.quantity + amount);
      else this.cart.push({ code: text(code), size: text(size), quantity: amount });
      write(KEYS.cart, this.cart);
      this.emit();
    },
    updateQuantity(code, size, qty) {
      if (Number(qty) < 1) return this.removeFromCart(code, size);
      const line = this.cart.find((l) => l.code === code && l.size === size);
      if (line) line.quantity = quantity(qty);
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
      else this.wishlist = this.wishlist.concat(text(code));
      write(KEYS.wishlist, this.wishlist);
      this.emit();
    },

    placeOrder(address) {
      const order = {
        id: "EA" + String(Date.now()).slice(-8),
        createdAt: new Date().toISOString(),
        status: "Confirmed",
        total: this.total(),
        address: address,
        lines: this.cartLines().map((e) => ({
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
      this.account = cleanAccount(account);
      write(KEYS.account, this.account);
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
