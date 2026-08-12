"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatPrice, priceOf, searchProducts } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { CloseIcon, SearchIcon } from "./icons";

const SUGGESTIONS = ["T-shirt", "Sweatshirt", "Bags", "Sneakers", "Dresses", "Sale"];

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
    else setQuery("");
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  const results = useMemo(() => (query.length > 1 ? searchProducts(query, 8) : []), [query]);

  if (!searchOpen) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    router.push(`/en-us/search/?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white animate-fade-in" role="dialog" aria-label="Search">
      <div className="flex h-14 items-center justify-between border-b border-line site-padding">
        <span className="text-label uppercase tracking-[0.2em]">Search</span>
        <button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)}>
          <CloseIcon />
        </button>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <form onSubmit={submit} className="flex items-center gap-3 border-b border-ink pb-3">
          <SearchIcon />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="What are you looking for?"
            className="w-full bg-transparent text-lg outline-none"
            aria-label="Search products"
            data-testid="search-input"
          />
        </form>

        {results.length > 0 ? (
          <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4" data-testid="search-results">
            {results.map((product) => (
              <li key={product.code}>
                <Link
                  href={`/en-us/emporio-armani/${product.slug}/`}
                  onClick={() => setSearchOpen(false)}
                  className="block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="aspect-pdp w-full bg-offwhite object-contain"
                    loading="lazy"
                  />
                  <p className="mt-2 text-tiny">{product.name}</p>
                  <p className="text-tiny text-muted">{formatPrice(priceOf(product))}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8">
            <p className="eyebrow mb-3 text-muted">Popular searches</p>
            <ul className="flex flex-wrap gap-3">
              {SUGGESTIONS.map((term) => (
                <li key={term}>
                  <button
                    type="button"
                    className="border border-line px-4 py-2 text-sm hover:border-ink"
                    onClick={() => setQuery(term)}
                  >
                    {term}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
