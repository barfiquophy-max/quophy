import Link from "next/link";
import EditorialBlock from "@/components/EditorialBlock";
import ProductTile from "@/components/ProductTile";
import { getNewArrivals, homeBlocks } from "@/lib/catalog";

export const metadata = {
  title: "Emporio Armani | Iconic Italian Style US",
};

export default function ExperiencePage() {
  const newArrivals = getNewArrivals().slice(0, 8);

  return (
    <div className="flex flex-col">
      {homeBlocks.slice(0, 3).map((block, index) => (
        <EditorialBlock key={block.title} block={block} priority={index === 0} />
      ))}

      <section className="site-padding py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-lg uppercase tracking-[0.12em]">New Arrivals</h2>
          <Link
            href="/en-us/emporio-armani/new-arrivals/man/"
            className="text-label uppercase underline underline-offset-4"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">
          {newArrivals.map((product) => (
            <ProductTile key={product.code} product={product} />
          ))}
        </div>
      </section>

      {homeBlocks.slice(3).map((block) => (
        <EditorialBlock key={block.title} block={block} height="short" />
      ))}

      <section className="site-padding py-16 text-center">
        <p className="eyebrow mb-3 text-muted">Follow</p>
        <h2 className="text-xl uppercase tracking-[0.2em]">@emporioarmani</h2>
      </section>
    </div>
  );
}
