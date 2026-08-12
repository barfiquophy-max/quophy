"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import ProductTile from "./ProductTile";
import { HeartIcon } from "./icons";

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line">
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-label uppercase tracking-[0.08em]"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {title}
        <span className="text-lg leading-none">{open ? "−" : "+"}</span>
      </button>
      {open ? <div className="pb-5 text-sm leading-relaxed text-muted">{children}</div> : null}
    </div>
  );
}

export default function Pdp({
  product,
  variants,
  related,
}: {
  product: Product;
  variants: Product[];
  related: Product[];
}) {
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [error, setError] = useState(false);
  const [zoomed, setZoomed] = useState<string | null>(null);
  const { addToCart, toggleWishlist, isWishlisted, hydrated } = useStore();
  const wishlisted = hydrated && isWishlisted(product.code);

  const submit = () => {
    if (!size) {
      setError(true);
      return;
    }
    setError(false);
    addToCart({ code: product.code, size, quantity: 1 });
  };

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="grid grid-cols-1 gap-px bg-line md:grid-cols-2">
          {product.images.map((image, index) => (
            <button
              key={image}
              type="button"
              className="relative aspect-pdp bg-offwhite"
              onClick={() => setZoomed(image)}
              aria-label={`Zoom image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${product.name} image ${index + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-contain"
                priority={index === 0}
              />
            </button>
          ))}
        </div>

        <div className="site-padding lg:sticky lg:top-24 lg:h-fit lg:py-10">
          {product.newSeason ? <p className="eyebrow mb-2 text-muted">New Season</p> : null}
          <h1 className="text-xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3 text-base">
            {product.salePrice !== null ? (
              <>
                <span className="text-muted line-through">{formatPrice(product.price ?? 0)}</span>
                <span className="text-sale">{formatPrice(product.salePrice)}</span>
              </>
            ) : (
              <span>{formatPrice(product.price ?? 0)}</span>
            )}
          </div>

          <p className="mt-6 text-label">Color: {product.color}</p>
          {variants.length > 1 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {variants.map((variant) => (
                <Link
                  key={variant.code}
                  href={`/en-us/emporio-armani/${variant.slug}/`}
                  className={`relative h-16 w-12 border ${
                    variant.code === product.code ? "border-ink" : "border-line"
                  }`}
                  title={variant.color}
                >
                  {variant.images[0] ? (
                    <Image src={variant.images[0]} alt={variant.color} fill sizes="48px" className="object-contain" />
                  ) : null}
                </Link>
              ))}
            </div>
          ) : null}

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between text-label">
              <span>Size: {size ?? "Select"}</span>
              <span className="text-muted underline underline-offset-4">Size Guide</span>
            </div>
            <div className="flex flex-wrap gap-2" data-testid="size-selector">
              {product.sizes.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSize(option);
                    setError(false);
                  }}
                  aria-pressed={size === option}
                  className={`min-w-12 border px-4 py-3 text-tiny ${
                    size === option ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {error ? (
              <p className="mt-2 text-tiny text-sale" data-testid="size-error">
                Please select a size.
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button type="button" className="btn-primary" onClick={submit} data-testid="add-to-cart">
              Add To Cart
            </button>
            <button
              type="button"
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={wishlisted}
              className="flex h-12 w-12 shrink-0 items-center justify-center border border-ink"
              onClick={() => toggleWishlist(product.code)}
            >
              <HeartIcon filled={wishlisted} />
            </button>
          </div>

          <ul className="mt-6 space-y-1 text-tiny text-muted">
            <li>Estimated shipping within 4/6 business days</li>
            <li>Free returns for all orders (some exclusions apply)</li>
            <li>Find and reserve in store</li>
          </ul>

          <div className="mt-8">
            <Accordion title="Information &amp; Details">
              <p>{product.description}</p>
              {product.bullets.length ? (
                <ul className="mt-4 list-disc space-y-1 pl-5">
                  {product.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
              {product.composition ? <p className="mt-4">{product.composition}</p> : null}
              <p className="mt-4">Product code: {product.code}</p>
            </Accordion>
            <Accordion title="Product care">
              <p>
                Follow the care label instructions. Professional dry cleaning is recommended for
                tailored and delicate items. Do not bleach, iron at low temperature.
              </p>
            </Accordion>
            <Accordion title="Shipping &amp; returns">
              <p>
                Free standard shipping on orders over $ 250. Returns are free within 14 days of
                delivery through the returns portal.
              </p>
            </Accordion>
          </div>
        </div>
      </div>

      {related.length ? (
        <section className="mt-16">
          <h2 className="site-padding pb-4 text-lg uppercase tracking-[0.12em]">You may also like</h2>
          <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">
            {related.map((item) => (
              <ProductTile key={item.code} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      {zoomed ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white animate-fade-in"
          role="dialog"
          aria-label="Product image"
          onClick={() => setZoomed(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoomed} alt={product.name} className="max-h-full max-w-full object-contain" />
        </div>
      ) : null}
    </div>
  );
}
