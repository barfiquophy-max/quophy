import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeCatalog } from "./fixtures/catalog.js";

let Catalog;

beforeEach(async () => {
  vi.resetModules();
  window.CATALOG = makeCatalog();
  await import("../assets/js/catalog.js");
  Catalog = window.Catalog;
});

describe("priceOf / formatPrice", () => {
  it("prefers the sale price when present", () => {
    expect(Catalog.priceOf({ price: 200, salePrice: 120 })).toBe(120);
    expect(Catalog.priceOf({ price: 200, salePrice: null })).toBe(200);
    expect(Catalog.priceOf({ price: 200, salePrice: 0 })).toBe(0);
  });

  it("formats integers without decimals and fractions with two", () => {
    expect(Catalog.formatPrice(1200)).toBe("$ 1,200");
    expect(Catalog.formatPrice(99.5)).toBe("$ 99.50");
  });
});

describe("lookups", () => {
  it("resolves products by slug and code, null when unknown", () => {
    expect(Catalog.getProduct("shirt-aaa").code).toBe("AAA_111_100");
    expect(Catalog.getByCode("AAA_111_200").slug).toBe("shirt-aaa-blue");
    expect(Catalog.getProduct("nope")).toBeNull();
    expect(Catalog.getByCode("nope")).toBeNull();
  });

  it("resolves categories by slug", () => {
    expect(Catalog.getCategory("man/clothing/shirts").title).toBe("Shirts");
    expect(Catalog.getCategory("man/nope")).toBeNull();
  });
});

describe("categoryProducts / listing", () => {
  it("returns category products in declared order", () => {
    expect(Catalog.categoryProducts("man/clothing/shirts").map((p) => p.code)).toEqual([
      "AAA_111_100",
      "AAA_111_200",
    ]);
  });

  it("returns an empty list for an unknown category", () => {
    expect(Catalog.categoryProducts("man/nope")).toEqual([]);
  });

  it("falls back to descendant categories, de-duplicated", () => {
    const codes = Catalog.listing("man/clothing").map((p) => p.code);
    expect(codes).toEqual(["AAA_111_100", "AAA_111_200", "BBB_222_100"]);
  });

  it("prefers an exact category match over descendants", () => {
    expect(Catalog.listing("man/clothing/t-shirts").map((p) => p.code)).toEqual(["BBB_222_100"]);
  });

  it("lists child categories of a path", () => {
    expect(Catalog.childCategories("man/clothing").map((c) => c.slug)).toEqual([
      "man/clothing/shirts",
      "man/clothing/t-shirts",
    ]);
  });
});

describe("merchandising filters", () => {
  it("filters sale products, optionally by gender", () => {
    expect(Catalog.saleProducts().map((p) => p.code)).toEqual(["BBB_222_100"]);
    expect(Catalog.saleProducts("woman")).toEqual([]);
  });

  it("filters new arrivals, optionally by gender", () => {
    expect(Catalog.newArrivals().map((p) => p.code)).toEqual(["AAA_111_200", "CCC_333_100"]);
    expect(Catalog.newArrivals("man").map((p) => p.code)).toEqual(["AAA_111_200"]);
  });

  it("groups colour variants by style key", () => {
    const variants = Catalog.colorVariants(Catalog.getByCode("AAA_111_100"));
    expect(variants.map((p) => p.color)).toEqual(["White", "Blue"]);
  });

  it("returns related products from the first category, excluding itself", () => {
    const related = Catalog.related(Catalog.getByCode("AAA_111_100"));
    expect(related.map((p) => p.code)).toEqual(["AAA_111_200"]);
    expect(Catalog.related(Catalog.getByCode("AAA_111_100"), 0).length).toBe(1);
  });

  it("returns no related products when the product has no category", () => {
    expect(Catalog.related({ code: "X", categories: [] })).toEqual([]);
  });
});

describe("search", () => {
  it("returns nothing for blank queries", () => {
    expect(Catalog.search("")).toEqual([]);
    expect(Catalog.search("   ")).toEqual([]);
    expect(Catalog.search(undefined)).toEqual([]);
  });

  it("matches on every term across name, colour and subcategory", () => {
    expect(Catalog.search("poplin white").map((p) => p.code)).toEqual(["AAA_111_100"]);
    expect(Catalog.search("poplin purple")).toEqual([]);
  });

  it("ranks name-prefix matches first", () => {
    const codes = Catalog.search("shirt").map((p) => p.code);
    expect(codes).toContain("BBB_222_100");
    expect(codes.indexOf("AAA_111_100")).toBeGreaterThan(-1);
  });

  it("honours the result limit", () => {
    expect(Catalog.search("shirt", 1).length).toBe(1);
  });
});
