"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, getProductByCode, priceOf } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, hydrated } = useStore();

  const lines = cart
    .map((line) => ({ line, product: getProductByCode(line.code) }))
    .filter((entry) => entry.product);
  const subtotal = lines.reduce(
    (sum, { line, product }) => sum + priceOf(product!) * line.quantity,
    0,
  );
  const shipping = subtotal > 250 || subtotal === 0 ? 0 : 15;

  return (
    <div className="site-padding py-10">
      <h1 className="mb-8 text-xl uppercase tracking-[0.1em]">Shopping Bag</h1>

      {!hydrated ? null : lines.length === 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted">Your shopping bag is empty.</p>
          <Link href="/en-us/emporio-armani/man/clothing/t-shirts/" className="btn-primary w-auto">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <ul className="divide-y divide-line border-y border-line">
            {lines.map(({ line, product }) => (
              <li key={`${line.code}-${line.size}`} className="flex gap-6 py-6">
                <Link
                  href={`/en-us/emporio-armani/${product!.slug}/`}
                  className="relative h-40 w-32 shrink-0 bg-offwhite"
                >
                  <Image src={product!.images[0]} alt={product!.name} fill sizes="128px" className="object-contain" />
                </Link>
                <div className="flex flex-1 flex-col gap-2 text-sm">
                  <Link href={`/en-us/emporio-armani/${product!.slug}/`} className="hover:underline">
                    {product!.name}
                  </Link>
                  <span className="text-tiny text-muted">
                    {product!.color} · Size {line.size} · {product!.code}
                  </span>
                  <span>{formatPrice(priceOf(product!))}</span>
                  <div className="mt-auto flex items-center gap-4">
                    <div className="flex items-center border border-line">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        className="px-3 py-1"
                        onClick={() => updateQuantity(line.code, line.size, line.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="px-3" data-testid="cart-line-qty">
                        {line.quantity}
                      </span>
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
                <span className="text-sm">{formatPrice(priceOf(product!) * line.quantity)}</span>
              </li>
            ))}
          </ul>

          <aside className="h-fit border border-line p-6">
            <h2 className="mb-4 text-label uppercase tracking-[0.1em]">Order summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd data-testid="cart-subtotal">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 font-medium">
                <dt>Total</dt>
                <dd data-testid="cart-total">{formatPrice(subtotal + shipping)}</dd>
              </div>
            </dl>
            <Link href="/en-us/checkout/" className="btn-primary mt-6">
              Proceed to checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
