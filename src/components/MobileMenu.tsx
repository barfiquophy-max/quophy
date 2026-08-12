"use client";

import Link from "next/link";
import { useState } from "react";
import { mainNav } from "@/lib/navigation";
import { useStore } from "@/lib/store";
import { ChevronIcon, CloseIcon } from "./icons";

export default function MobileMenu() {
  const { menuOpen, setMenuOpen } = useStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!menuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-label="Menu">
      <div className="flex-1 bg-black/40" onClick={() => setMenuOpen(false)} />
      <div className="h-full w-[85%] max-w-sm overflow-y-auto bg-white animate-slide-in-right">
        <div className="flex h-14 items-center justify-between border-b border-line px-4">
          <span className="text-label uppercase tracking-[0.2em]">Menu</span>
          <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        <nav className="px-4 py-2">
          {mainNav.map((entry) => (
            <div key={entry.label} className="border-b border-line">
              <button
                type="button"
                className="flex w-full items-center justify-between py-4 text-label uppercase tracking-[0.08em]"
                onClick={() => setExpanded(expanded === entry.label ? null : entry.label)}
                aria-expanded={expanded === entry.label}
              >
                {entry.label}
                <ChevronIcon
                  className={`h-4 w-4 transition-transform ${expanded === entry.label ? "rotate-90" : ""}`}
                />
              </button>
              {expanded === entry.label ? (
                <div className="pb-4">
                  {entry.columns.map((column) => (
                    <div key={column.title} className="mb-4">
                      <p className="eyebrow mb-2 text-muted">{column.title}</p>
                      <ul className="space-y-2">
                        {column.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className="text-sm"
                              onClick={() => setMenuOpen(false)}
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          <div className="space-y-3 py-6 text-sm">
            <Link href="/en-us/wishlist/" onClick={() => setMenuOpen(false)} className="block">
              Wishlist
            </Link>
            <Link href="/en-us/my-account/" onClick={() => setMenuOpen(false)} className="block">
              My Account
            </Link>
            <Link href="/en-us/help/" onClick={() => setMenuOpen(false)} className="block">
              Help
            </Link>
            <Link href="/en-us/stores/" onClick={() => setMenuOpen(false)} className="block">
              Store locator
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
