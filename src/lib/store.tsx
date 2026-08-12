"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Address, CartLine, Order } from "./types";

const CART_KEY = "ea-cart";
const WISHLIST_KEY = "ea-wishlist";
const ORDERS_KEY = "ea-orders";
const ACCOUNT_KEY = "ea-account";

export type Account = { email: string; firstName: string; lastName: string };

type StoreValue = {
  cart: CartLine[];
  wishlist: string[];
  orders: Order[];
  account: Account | null;
  cartCount: number;
  addToCart: (line: CartLine) => void;
  updateQuantity: (code: string, size: string, quantity: number) => void;
  removeFromCart: (code: string, size: string) => void;
  clearCart: () => void;
  toggleWishlist: (code: string) => void;
  isWishlisted: (code: string) => boolean;
  placeOrder: (order: Order) => void;
  signIn: (account: Account) => void;
  signOut: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  hydrated: boolean;
};

const StoreContext = createContext<StoreValue | null>(null);

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setCart(read<CartLine[]>(CART_KEY, []));
    setWishlist(read<string[]>(WISHLIST_KEY, []));
    setOrders(read<Order[]>(ORDERS_KEY, []));
    setAccount(read<Account | null>(ACCOUNT_KEY, null));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) write(CART_KEY, cart);
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated) write(WISHLIST_KEY, wishlist);
  }, [wishlist, hydrated]);
  useEffect(() => {
    if (hydrated) write(ORDERS_KEY, orders);
  }, [orders, hydrated]);
  useEffect(() => {
    if (hydrated) write(ACCOUNT_KEY, account);
  }, [account, hydrated]);

  const addToCart = useCallback((line: CartLine) => {
    setCart((current) => {
      const existing = current.find((l) => l.code === line.code && l.size === line.size);
      if (existing) {
        return current.map((l) =>
          l === existing ? { ...l, quantity: l.quantity + line.quantity } : l,
        );
      }
      return [...current, line];
    });
    setCartOpen(true);
  }, []);

  const updateQuantity = useCallback((code: string, size: string, quantity: number) => {
    setCart((current) =>
      quantity <= 0
        ? current.filter((l) => !(l.code === code && l.size === size))
        : current.map((l) => (l.code === code && l.size === size ? { ...l, quantity } : l)),
    );
  }, []);

  const removeFromCart = useCallback((code: string, size: string) => {
    setCart((current) => current.filter((l) => !(l.code === code && l.size === size)));
  }, []);

  const toggleWishlist = useCallback((code: string) => {
    setWishlist((current) =>
      current.includes(code) ? current.filter((c) => c !== code) : [...current, code],
    );
  }, []);

  const placeOrder = useCallback((order: Order) => {
    setOrders((current) => [order, ...current]);
    setCart([]);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      cart,
      wishlist,
      orders,
      account,
      cartCount: cart.reduce((sum, line) => sum + line.quantity, 0),
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart: () => setCart([]),
      toggleWishlist,
      isWishlisted: (code: string) => wishlist.includes(code),
      placeOrder,
      signIn: setAccount,
      signOut: () => setAccount(null),
      cartOpen,
      setCartOpen,
      searchOpen,
      setSearchOpen,
      menuOpen,
      setMenuOpen,
      hydrated,
    }),
    [
      cart,
      wishlist,
      orders,
      account,
      addToCart,
      updateQuantity,
      removeFromCart,
      toggleWishlist,
      placeOrder,
      cartOpen,
      searchOpen,
      menuOpen,
      hydrated,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}

export type { Address };
