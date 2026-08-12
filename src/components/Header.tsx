"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { mainNav } from "@/lib/navigation";
import { useStore } from "@/lib/store";
import { BagIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from "./icons";

const PROMO_MESSAGES = [
  "UP TO 50% OFF SPRING SUMMER SALE",
  "FREE SHIPPING ON ALL ORDERS OVER $ 250",
];

export default function Header() {
  const { cartCount, wishlist, setCartOpen, setSearchOpen, setMenuOpen, hydrated } = useStore();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setPromoIndex((i) => (i + 1) % PROMO_MESSAGES.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white" onMouseLeave={() => setOpenMenu(null)}>
      <div className="flex items-center justify-center gap-4 bg-ink px-4 py-2 text-center text-micro uppercase tracking-[0.12em] text-white">
        <span>{promoIndex + 1} / {PROMO_MESSAGES.length}</span>
        <Link href="/en-us/emporio-armani/sale/man/" className="hover:underline">
          {PROMO_MESSAGES[promoIndex]}
        </Link>
      </div>
      <div className="relative flex h-14 items-center justify-between border-b border-line site-padding">
        <div className="flex items-center gap-5">
          <button
            type="button"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </button>
          <nav className="hidden items-center gap-6 lg:flex">
            {mainNav.map((entry) => (
              <Link
                key={entry.label}
                href={entry.href}
                onMouseEnter={() => setOpenMenu(entry.label)}
                onFocus={() => setOpenMenu(entry.label)}
                className="text-label uppercase tracking-[0.08em] hover:underline"
                data-testid={`nav-${entry.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {entry.label}
              </Link>
            ))}
          </nav>
        </div>

        <Link
          href="/en-us/emporio-armani/experience/"
          className="absolute left-1/2 -translate-x-1/2 text-center text-[13px] font-medium uppercase tracking-[0.28em]"
        >
          Emporio Armani
        </Link>

        <div className="flex items-center gap-4">
          <button type="button" aria-label="Search" onClick={() => setSearchOpen(true)}>
            <SearchIcon />
          </button>
          <Link href="/en-us/wishlist/" aria-label="Wishlist" className="relative hidden sm:block">
            <HeartIcon />
            {hydrated && wishlist.length > 0 ? (
              <span className="absolute -right-2 -top-1 text-micro">{wishlist.length}</span>
            ) : null}
          </Link>
          <Link href="/en-us/my-account/" aria-label="My account" className="hidden sm:block">
            <UserIcon />
          </Link>
          <button
            type="button"
            aria-label="Shopping bag"
            className="relative"
            onClick={() => setCartOpen(true)}
            data-testid="cart-button"
          >
            <BagIcon />
            {hydrated && cartCount > 0 ? (
              <span
                className="absolute -right-2 -top-1 text-micro"
                data-testid="cart-count"
              >
                {cartCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {openMenu ? (
        <div
          className="absolute inset-x-0 top-full hidden border-b border-line bg-white shadow-sm animate-slide-down lg:block"
          onMouseLeave={() => setOpenMenu(null)}
        >
          {mainNav
            .filter((entry) => entry.label === openMenu)
            .map((entry) => (
              <div key={entry.label} className="grid grid-cols-4 gap-8 px-8 py-10">
                {entry.columns.map((column) => (
                  <div key={column.title}>
                    <p className="eyebrow mb-4 text-muted">{column.title}</p>
                    <ul className="space-y-2">
                      {column.links.map((link) => (
                        <li key={link.href}>
                          <Link href={link.href} className="text-sm hover:underline">
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {entry.promo ? (
                  <Link href={entry.promo.href} className="group col-start-4 block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.promo.image}
                      alt={entry.promo.title}
                      className="aspect-[4/5] w-full object-cover"
                      loading="lazy"
                    />
                    <p className="mt-3 text-label uppercase tracking-[0.08em] group-hover:underline">
                      {entry.promo.title}
                    </p>
                  </Link>
                ) : null}
              </div>
            ))}
        </div>
      ) : null}
    </header>
  );
}
