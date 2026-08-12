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

  const listeners = [];

  const Store = {
    cart: read(KEYS.cart, []),
    wishlist: read(KEYS.wishlist, []),
    orders: read(KEYS.orders, []),
    account: read(KEYS.account, null),

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

    addToCart(code, size, quantity) {
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
