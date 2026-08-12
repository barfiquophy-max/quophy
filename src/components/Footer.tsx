"use client";

import Link from "next/link";
import { useState } from "react";
import { footerColumns } from "@/lib/navigation";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="border-t border-line bg-white">
      <div className="grid gap-8 border-b border-line site-padding py-10 md:grid-cols-3">
        <form
          className="md:col-span-2"
          onSubmit={(event) => {
            event.preventDefault();
            setSubscribed(true);
          }}
        >
          <p className="eyebrow mb-3">Newsletter</p>
          {subscribed ? (
            <p className="text-sm" data-testid="newsletter-success">
              Thank you for subscribing. Please check your inbox to confirm.
            </p>
          ) : (
            <div className="flex max-w-md gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                aria-label="Email"
                className="field"
                data-testid="newsletter-email"
              />
              <button type="submit" className="btn-primary w-auto whitespace-nowrap">
                Sign up
              </button>
            </div>
          )}
        </form>
        <div>
          <p className="eyebrow mb-3">Store locator</p>
          <Link href="/en-us/stores/" className="text-sm underline underline-offset-4">
            Our locations
          </Link>
          <p className="eyebrow mb-2 mt-6">Country / Region</p>
          <p className="text-sm">United States (USD) | English</p>
        </div>
      </div>

      <div className="grid gap-8 site-padding py-10 md:grid-cols-4">
        {footerColumns.map((column) => (
          <div key={column.title}>
            <p className="eyebrow mb-4">{column.title}</p>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={`${column.title}-${link.href}`}>
                  <Link href={link.href} className="text-sm text-muted hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-line site-padding py-6 text-tiny text-muted md:flex-row md:items-center md:justify-between">
        <span>Follow us on: Instagram · Facebook · YouTube · TikTok</span>
        <span>Copyright © 2026 Giorgio Armani S.p.A. - All Rights Reserved</span>
      </div>
    </footer>
  );
}
