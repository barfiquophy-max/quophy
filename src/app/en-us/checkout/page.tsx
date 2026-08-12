"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice, getProductByCode, priceOf } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import type { Address, Order } from "@/lib/types";

const EMPTY_ADDRESS: Address = {
  firstName: "",
  lastName: "",
  email: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
};

export default function CheckoutPage() {
  const { cart, placeOrder, hydrated, account } = useStore();
  const [step, setStep] = useState<"address" | "payment" | "done">("address");
  const [address, setAddress] = useState<Address>({
    ...EMPTY_ADDRESS,
    email: account?.email ?? "",
    firstName: account?.firstName ?? "",
    lastName: account?.lastName ?? "",
  });
  const [order, setOrder] = useState<Order | null>(null);

  const lines = cart
    .map((line) => ({ line, product: getProductByCode(line.code) }))
    .filter((entry) => entry.product);
  const subtotal = lines.reduce((sum, { line, product }) => sum + priceOf(product!) * line.quantity, 0);
  const shipping = subtotal > 250 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping;

  const confirm = () => {
    const created: Order = {
      id: `EA${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      lines: lines.map(({ line, product }) => ({
        ...line,
        name: product!.name,
        price: priceOf(product!),
        image: product!.images[0],
        color: product!.color,
      })),
      total,
      address,
      status: "Confirmed",
    };
    setOrder(created);
    placeOrder(created);
    setStep("done");
  };

  const field = (key: keyof Address, label: string, type = "text") => (
    <label className="block">
      <span className="mb-1 block text-tiny text-muted">{label}</span>
      <input
        type={type}
        required
        className="field"
        value={address[key]}
        onChange={(event) => setAddress({ ...address, [key]: event.target.value })}
        data-testid={`checkout-${key}`}
      />
    </label>
  );

  if (step === "done" && order) {
    return (
      <div className="site-padding py-16 text-center">
        <h1 className="text-xl uppercase tracking-[0.1em]">Thank you for your order</h1>
        <p className="mt-4 text-sm" data-testid="order-confirmation">
          Order {order.id} has been confirmed. A confirmation email was sent to {order.address.email}.
        </p>
        <p className="mt-2 text-sm text-muted">Total paid: {formatPrice(order.total)}</p>
        <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3">
          <Link href="/en-us/track/orders/" className="btn-secondary">
            Track your order
          </Link>
          <Link href="/en-us/emporio-armani/experience/" className="btn-primary">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (hydrated && lines.length === 0) {
    return (
      <div className="site-padding py-16">
        <h1 className="text-xl uppercase tracking-[0.1em]">Checkout</h1>
        <p className="mt-4 text-sm text-muted">Your shopping bag is empty.</p>
      </div>
    );
  }

  return (
    <div className="site-padding grid gap-10 py-10 lg:grid-cols-[2fr_1fr]">
      <div>
        <h1 className="mb-8 text-xl uppercase tracking-[0.1em]">Checkout</h1>
        <ol className="mb-8 flex gap-6 text-label uppercase tracking-[0.08em]">
          <li className={step === "address" ? "underline underline-offset-4" : "text-muted"}>
            1. Shipping
          </li>
          <li className={step === "payment" ? "underline underline-offset-4" : "text-muted"}>
            2. Payment
          </li>
        </ol>

        {step === "address" ? (
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              setStep("payment");
            }}
          >
            {field("firstName", "First name")}
            {field("lastName", "Last name")}
            {field("email", "Email", "email")}
            {field("address", "Address")}
            {field("city", "City")}
            {field("state", "State")}
            {field("zip", "ZIP code")}
            {field("country", "Country")}
            <div className="md:col-span-2">
              <button type="submit" className="btn-primary" data-testid="continue-to-payment">
                Continue to payment
              </button>
            </div>
          </form>
        ) : (
          <form
            className="max-w-md space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              confirm();
            }}
          >
            <label className="block">
              <span className="mb-1 block text-tiny text-muted">Card number</span>
              <input required className="field" placeholder="4242 4242 4242 4242" data-testid="card-number" />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-1 block text-tiny text-muted">Expiry</span>
                <input required className="field" placeholder="MM/YY" />
              </label>
              <label className="block">
                <span className="mb-1 block text-tiny text-muted">CVV</span>
                <input required className="field" placeholder="123" />
              </label>
            </div>
            <p className="text-tiny text-muted">
              This is a demo checkout. No payment is processed and no card data is stored.
            </p>
            <button type="submit" className="btn-primary" data-testid="place-order">
              Place order
            </button>
            <button type="button" className="btn-secondary" onClick={() => setStep("address")}>
              Back to shipping
            </button>
          </form>
        )}
      </div>

      <aside className="h-fit border border-line p-6">
        <h2 className="mb-4 text-label uppercase tracking-[0.1em]">Order summary</h2>
        <ul className="mb-4 space-y-3 text-sm">
          {lines.map(({ line, product }) => (
            <li key={`${line.code}-${line.size}`} className="flex justify-between gap-4">
              <span>
                {product!.name}
                <span className="block text-tiny text-muted">
                  Size {line.size} × {line.quantity}
                </span>
              </span>
              <span>{formatPrice(priceOf(product!) * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
          </div>
          <div className="flex justify-between font-medium">
            <dt>Total</dt>
            <dd data-testid="checkout-total">{formatPrice(total)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
