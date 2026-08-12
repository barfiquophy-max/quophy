"use client";

import Link from "next/link";
import ProductTile from "@/components/ProductTile";
import { getProductByCode } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export default function WishlistPage() {
  const { wishlist, hydrated } = useStore();
  const products = wishlist.map(getProductByCode).filter(Boolean);

  return (
    <div className="py-10">
      <h1 className="mb-8 site-padding text-xl uppercase tracking-[0.1em]">Wishlist</h1>
      {!hydrated ? null : products.length === 0 ? (
        <div className="space-y-4 site-padding">
          <p className="text-sm text-muted">Your wishlist is empty.</p>
          <Link href="/en-us/emporio-armani/woman/bags/" className="btn-primary w-auto">
            Discover the collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">
          {products.map((product) => (
            <ProductTile key={product!.code} product={product!} />
          ))}
        </div>
      )}
    </div>
  );
}
