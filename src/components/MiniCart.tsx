"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, getProductByCode, priceOf } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { CloseIcon } from "./icons";

export default function MiniCart() {
  const { cart, cartOpen, setCartOpen, updateQuantity, removeFromCart } = useStore();

  if (!cartOpen) return null;

  const lines = cart
    .map((line) => ({ line, product: getProductByCode(line.code) }))
    .filter((entry): entry is { line: typeof cart[number]; product: NonNullable<ReturnType<typeof getProductByCode>> } =>
      Boolean(entry.product),
    );
  const subtotal = lines.reduce((sum, { line, product }) => sum + priceOf(product) * line.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-label="Shopping bag">
      <div className="flex-1 bg-black/40" onClick={() => setCartOpen(false)} />
      <aside className="flex h-full w-full max-w-md flex-col bg-white animate-slide-in-right">
        <div className="flex h-14 items-center justify-between border-b border-line px-4">
          <span className="text-label uppercase tracking-[0.12em]">
            Shopping Bag ({lines.reduce((n, { line }) => n + line.quantity, 0)})
          </span>
          <button type="button" aria-label="Close bag" onClick={() => setCartOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {lines.length === 0 ? (
            <p className="p-6 text-sm text-muted">Your shopping bag is empty.</p>
          ) : (
            <ul>
              {lines.map(({ line, product }) => (
                <li key={`${line.code}-${line.size}`} className="flex gap-4 border-b border-line p-4">
                  <Link
                    href={`/en-us/emporio-armani/${product.slug}/`}
                    className="relative h-32 w-24 shrink-0 bg-offwhite"
                    onClick={() => setCartOpen(false)}
                  >
                    {product.images[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill sizes="96px" className="object-contain" />
                    ) : null}
                  </Link>
                  <div className="flex flex-1 flex-col gap-1 text-sm">
                    <span>{product.name}</span>
                    <span className="text-tiny text-muted">
                      {product.color} · Size {line.size}
                    </span>
                    <span>{formatPrice(priceOf(product) * line.quantity)}</span>
                    <div className="mt-auto flex items-center gap-3">
                      <div className="flex items-center border border-line">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          className="px-3 py-1"
                          onClick={() => updateQuantity(line.code, line.size, line.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="px-3">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          className="px-3 py-1"
                          onClick={() => updateQuantity(line.code, line.size, line.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-tiny uppercase underline"
                        onClick={() => removeFromCart(line.code, line.size)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3 border-t border-line p-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span data-testid="minicart-subtotal">{formatPrice(subtotal)}</span>
          </div>
          <Link href="/en-us/cart/" className="btn-secondary" onClick={() => setCartOpen(false)}>
            View Bag
          </Link>
          <Link
            href="/en-us/checkout/"
            className={`btn-primary ${lines.length === 0 ? "pointer-events-none opacity-40" : ""}`}
            onClick={() => setCartOpen(false)}
          >
            Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
