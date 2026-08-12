"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export default function AccountPage() {
  const { account, orders, signIn, signOut, wishlist, hydrated } = useStore();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "" });

  if (!hydrated) return <div className="site-padding py-16" />;

  if (!account) {
    return (
      <div className="site-padding py-12">
        <h1 className="mb-8 text-xl uppercase tracking-[0.1em]">My Account</h1>
        <div className="flex gap-6 border-b border-line pb-3 text-label uppercase tracking-[0.08em]">
          <button
            type="button"
            className={mode === "signin" ? "underline underline-offset-4" : "text-muted"}
            onClick={() => setMode("signin")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === "register" ? "underline underline-offset-4" : "text-muted"}
            onClick={() => setMode("register")}
          >
            Create account
          </button>
        </div>
        <form
          className="mt-6 max-w-md space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            signIn({
              email: form.email,
              firstName: form.firstName || form.email.split("@")[0],
              lastName: form.lastName,
            });
          }}
        >
          {mode === "register" ? (
            <div className="grid grid-cols-2 gap-4">
              <input
                className="field"
                placeholder="First name"
                aria-label="First name"
                required
                value={form.firstName}
                onChange={(event) => setForm({ ...form, firstName: event.target.value })}
              />
              <input
                className="field"
                placeholder="Last name"
                aria-label="Last name"
                required
                value={form.lastName}
                onChange={(event) => setForm({ ...form, lastName: event.target.value })}
              />
            </div>
          ) : null}
          <input
            className="field"
            type="email"
            placeholder="Email"
            aria-label="Email"
            required
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            data-testid="account-email"
          />
          <input
            className="field"
            type="password"
            placeholder="Password"
            aria-label="Password"
            required
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            data-testid="account-password"
          />
          <button type="submit" className="btn-primary" data-testid="account-submit">
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
          <p className="text-tiny text-muted">
            Demo account area — credentials are stored locally in your browser only.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="site-padding py-12">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl uppercase tracking-[0.1em]">
          Hello, {account.firstName || account.email}
        </h1>
        <button type="button" className="text-label uppercase underline" onClick={signOut}>
          Sign out
        </button>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-3">
        <section className="md:col-span-2">
          <h2 className="mb-4 text-label uppercase tracking-[0.1em]">Orders</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-muted">You have no orders yet.</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {orders.map((order) => (
                <li key={order.id} className="py-4 text-sm">
                  <div className="flex justify-between">
                    <span>Order {order.id}</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                  <p className="text-tiny text-muted">
                    {new Date(order.createdAt).toLocaleDateString("en-US")} · {order.status} ·{" "}
                    {order.lines.length} item(s)
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside className="space-y-3 text-sm">
          <h2 className="text-label uppercase tracking-[0.1em]">Shortcuts</h2>
          <Link href="/en-us/wishlist/" className="block underline underline-offset-4">
            Wishlist ({wishlist.length})
          </Link>
          <Link href="/en-us/track/orders/" className="block underline underline-offset-4">
            Track your order
          </Link>
          <Link href="/en-us/track/returns/" className="block underline underline-offset-4">
            Track my return
          </Link>
        </aside>
      </div>
    </div>
  );
}
