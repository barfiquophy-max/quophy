import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Pdp from "@/components/Pdp";
import PlpFilters from "@/components/PlpFilters";
import {
  categories,
  getCategory,
  getCategoryProducts,
  getColorVariants,
  getNewArrivals,
  getProductBySlug,
  getRelatedProducts,
  getSaleProducts,
} from "@/lib/catalog";
import type { Product } from "@/lib/types";

type Params = { params: Promise<{ slug: string[] }> };

const GENDER_LABELS: Record<string, string> = { man: "Man", woman: "Woman", kids: "Kids" };

const titleCase = (value: string) =>
  value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

function resolve(slug: string[]) {
  const path = slug.join("/");
  const product = getProductBySlug(path);
  if (product) return { kind: "pdp" as const, product };

  if (slug[0] === "sale" && slug[1]) {
    return {
      kind: "listing" as const,
      title: `${GENDER_LABELS[slug[1]] ?? slug[1]}'s Sale`,
      products: getSaleProducts(slug[1]),
      crumbs: [{ label: "Sale" }],
    };
  }
  if (slug[0] === "new-arrivals" && slug[1]) {
    return {
      kind: "listing" as const,
      title: `${GENDER_LABELS[slug[1]] ?? slug[1]}'s New Arrivals`,
      products: getNewArrivals(slug[1]),
      crumbs: [{ label: "New Arrivals" }],
    };
  }

  const category = getCategory(path);
  if (category) {
    return {
      kind: "listing" as const,
      title: category.title,
      products: getCategoryProducts(path),
      crumbs: [
        {
          label: GENDER_LABELS[category.gender] ?? category.gender,
          href: `/en-us/emporio-armani/${category.gender}/`,
        },
        { label: category.label },
      ],
      category,
    };
  }

  // gender or group landing (e.g. man, man/clothing) aggregates child categories
  const children = categories.filter((c) => c.slug === path || c.slug.startsWith(`${path}/`));
  if (children.length) {
    const seen = new Set<string>();
    const products: Product[] = [];
    for (const child of children) {
      for (const item of getCategoryProducts(child.slug)) {
        if (!seen.has(item.code)) {
          seen.add(item.code);
          products.push(item);
        }
      }
    }
    return {
      kind: "listing" as const,
      title: `${GENDER_LABELS[slug[0]] ?? titleCase(slug[0])}${slug[1] ? ` ${titleCase(slug[1])}` : ""}`,
      products,
      crumbs: slug.map((part) => ({ label: GENDER_LABELS[part] ?? titleCase(part) })),
      children,
    };
  }

  return null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const result = resolve(slug);
  if (!result) return { title: "Emporio Armani" };
  const title = result.kind === "pdp" ? result.product.name : result.title;
  return { title: `${title} | Emporio Armani US` };
}

export default async function CatalogPage({ params }: Params) {
  const { slug } = await params;
  const result = resolve(slug);
  if (!result) notFound();

  if (result.kind === "pdp") {
    const { product } = result;
    const category = product.categories[0]?.split("/") ?? [];
    return (
      <div className="pb-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/en-us/emporio-armani/experience/" },
            {
              label: GENDER_LABELS[product.gender] ?? product.gender,
              href: `/en-us/emporio-armani/${product.gender}/`,
            },
            ...(category.length
              ? [
                  {
                    label: titleCase(product.sub ?? product.group),
                    href: `/en-us/emporio-armani/${product.categories[0]}/`,
                  },
                ]
              : []),
            { label: product.name },
          ]}
        />
        <Pdp
          product={product}
          variants={getColorVariants(product)}
          related={getRelatedProducts(product)}
        />
      </div>
    );
  }

  return (
    <div className="pb-16">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/en-us/emporio-armani/experience/" },
          ...result.crumbs,
        ]}
      />
      <div className="site-padding pb-6">
        <h1 className="text-xl uppercase tracking-[0.1em] first-letter:uppercase">{result.title}</h1>
      </div>
      {"children" in result && result.children && result.children.length > 1 ? (
        <nav className="flex flex-wrap gap-x-4 gap-y-2 site-padding pb-6 text-label">
          {result.children.map((child) => (
            <Link
              key={child.slug}
              href={`/en-us/emporio-armani/${child.slug}/`}
              className="underline underline-offset-4 hover:opacity-70"
            >
              {child.label}
            </Link>
          ))}
        </nav>
      ) : null}
      <PlpFilters products={result.products} />
    </div>
  );
}
