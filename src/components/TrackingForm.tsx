"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";

export default function TrackingForm({ kind }: { kind: "order" | "return" }) {
  const { orders } = useStore();
  const [reference, setReference] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = orders.find((order) => order.id.toLowerCase() === reference.trim().toLowerCase());
    if (kind === "order") {
      setResult(
        found
          ? `Order ${found.id} — ${found.status}. Estimated delivery within 4/6 business days.`
          : `We could not find an order with reference “${reference}”.`,
      );
    } else {
      setResult(
        found
          ? `No return has been requested for order ${found.id} yet. Returns are free within 14 days.`
          : `We could not find a return with reference “${reference}”.`,
      );
    }
  };

  return (
    <form className="max-w-md space-y-4" onSubmit={submit}>
      <label className="block">
        <span className="mb-1 block text-tiny text-muted">
          {kind === "order" ? "Order number" : "Return number"}
        </span>
        <input
          className="field"
          required
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="EA12345678"
          data-testid="tracking-reference"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-tiny text-muted">Email</span>
        <input className="field" type="email" required placeholder="you@example.com" />
      </label>
      <button type="submit" className="btn-primary" data-testid="tracking-submit">
        Track
      </button>
      {result ? (
        <p className="text-sm" data-testid="tracking-result">
          {result}
        </p>
      ) : null}
    </form>
  );
}
