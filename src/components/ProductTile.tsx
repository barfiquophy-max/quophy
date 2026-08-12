"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { HeartIcon } from "./icons";

export default function ProductTile({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [hover, setHover] = useState(false);
  const { addToCart, toggleWishlist, isWishlisted, hydrated } = useStore();
  const href = `/en-us/emporio-armani/${product.slug}/`;
  const image = hover && product.images[1] ? product.images[1] : product.images[0];
  const wishlisted = hydrated && isWishlisted(product.code);

  return (
    <div
      className="group relative flex h-full flex-col bg-offwhite"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-testid="product-tile"
    >
      <Link href={href} className="relative block aspect-pdp overflow-hidden bg-white">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain transition-opacity duration-300"
            priority={priority}
          />
        ) : null}
        {product.newSeason ? (
          <span className="absolute left-3 top-3 bg-white/90 px-2 py-1 text-micro uppercase tracking-[0.1em]">
            New Season
          </span>
        ) : null}
      </Link>
      <button
        type="button"
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wishlisted}
        onClick={() => toggleWishlist(product.code)}
        className="absolute right-3 top-3 p-1 text-ink transition-opacity hover:opacity-60"
      >
        <HeartIcon filled={wishlisted} />
      </button>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link href={href} className="text-sm leading-snug hover:underline">
          {product.name}
        </Link>
        <div className="flex items-center gap-2 text-sm">
          {product.salePrice !== null ? (
            <>
              <span className="text-muted line-through">{formatPrice(product.price ?? 0)}</span>
              <span className="text-sale">{formatPrice(product.salePrice)}</span>
              <span className="text-sale">
                -{Math.round(100 - (product.salePrice / (product.price || 1)) * 100)}%
              </span>
            </>
          ) : (
            <span>{formatPrice(product.price ?? 0)}</span>
          )}
        </div>
        <div className="text-tiny text-muted">
          {product.color}
          {product.extraColors > 0
            ? ` + ${product.extraColors} color${product.extraColors > 1 ? "s" : ""}`
            : ""}
        </div>
        <button
          type="button"
          onClick={() =>
            addToCart({ code: product.code, size: product.sizes[0] ?? "ONE SIZE", quantity: 1 })
          }
          className="mt-auto pt-2 text-left text-tiny uppercase tracking-[0.08em] underline underline-offset-4 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
        >
          Add To Cart
        </button>
      </div>
    </div>
  );
}
