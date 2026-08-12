import { Suspense } from "react";
import PlpFilters from "@/components/PlpFilters";
import { searchProducts } from "@/lib/catalog";

type Props = { searchParams: Promise<{ q?: string }> };

export const metadata = { title: "Search | Emporio Armani US" };

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const results = searchProducts(q, 200);

  return (
    <div className="py-10">
      <div className="site-padding pb-6">
        <h1 className="text-xl uppercase tracking-[0.1em]">Search</h1>
        <p className="mt-2 text-sm text-muted">
          {q ? `${results.length} results for “${q}”` : "Enter a search term to find products."}
        </p>
      </div>
      <Suspense>
        <PlpFilters products={results} />
      </Suspense>
    </div>
  );
}
