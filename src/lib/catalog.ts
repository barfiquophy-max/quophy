import categoriesData from "@/data/categories.json";
import homeData from "@/data/home.json";
import productsData from "@/data/products.json";
import type { Category, EditorialBlock, Product } from "./types";

export const products = productsData as Product[];
export const categories = categoriesData as Category[];
export const homeBlocks = homeData as EditorialBlock[];

const bySlug = new Map(products.map((p) => [p.slug, p]));
const byCode = new Map(products.map((p) => [p.code, p]));
const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

export function getProductBySlug(slug: string): Product | undefined {
  return bySlug.get(slug);
}

export function getProductByCode(code: string): Product | undefined {
  return byCode.get(code);
}

export function getCategory(slug: string): Category | undefined {
  return categoryBySlug.get(slug);
}

export function getCategoryProducts(slug: string): Product[] {
  const category = categoryBySlug.get(slug);
  if (!category) return [];
  return category.productCodes
    .map((code) => byCode.get(code))
    .filter((p): p is Product => Boolean(p));
}

export function getGenderCategories(gender: string): Category[] {
  return categories.filter((c) => c.gender === gender);
}

export function getSaleProducts(gender?: string): Product[] {
  return products.filter(
    (p) => p.salePrice !== null && (!gender || p.gender === gender),
  );
}

export function getNewArrivals(gender?: string): Product[] {
  return products.filter((p) => p.newSeason && (!gender || p.gender === gender));
}

export function getRelatedProducts(product: Product, limit = 8): Product[] {
  const siblings = getCategoryProducts(product.categories[0] ?? "");
  return siblings.filter((p) => p.code !== product.code).slice(0, limit);
}

export function getColorVariants(product: Product): Product[] {
  const base = product.code.split("_").slice(0, 2).join("_");
  return products.filter((p) => p.code.startsWith(`${base}_`));
}

export function priceOf(product: Product): number {
  return product.salePrice ?? product.price ?? 0;
}

export function formatPrice(value: number): string {
  return `$ ${value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function searchProducts(query: string, limit = 48): Product[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const scored = products
    .map((product) => {
      const haystack =
        `${product.name} ${product.color} ${product.gender} ${product.group} ${product.sub ?? ""}`.toLowerCase();
      const score = terms.reduce(
        (acc, term) => (haystack.includes(term) ? acc + (product.name.toLowerCase().includes(term) ? 2 : 1) : acc),
        0,
      );
      return { product, score };
    })
    .filter((entry) => entry.score >= terms.length)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((entry) => entry.product);
}
