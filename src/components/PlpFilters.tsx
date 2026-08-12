"use client";

import { useMemo, useState } from "react";
import ProductTile from "@/components/ProductTile";
import { priceOf } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { CloseIcon, FilterIcon } from "./icons";

const SORTS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A-Z" },
] as const;

type Sort = (typeof SORTS)[number]["value"];

const PAGE_SIZE = 12;

export default function PlpFilters({ products }: { products: Product[] }) {
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("recommended");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [panelOpen, setPanelOpen] = useState(false);

  const allSizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.sizes))).slice(0, 40),
    [products],
  );
  const allColors = useMemo(
    () => Array.from(new Set(products.map((p) => p.color).filter(Boolean))).sort(),
    [products],
  );

  const filtered = useMemo(() => {
    let result = products.filter((product) => {
      if (sizes.length && !product.sizes.some((size) => sizes.includes(size))) return false;
      if (colors.length && !colors.includes(product.color)) return false;
      if (onSaleOnly && product.salePrice === null) return false;
      return true;
    });
    if (sort === "price-asc") result = [...result].sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "price-desc") result = [...result].sort((a, b) => priceOf(b) - priceOf(a));
    if (sort === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, sizes, colors, onSaleOnly, sort]);

  const toggle = (list: string[], setList: (value: string[]) => void, value: string) => {
    setVisible(PAGE_SIZE);
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const activeCount = sizes.length + colors.length + (onSaleOnly ? 1 : 0);

  return (
    <div>
      <div className="sticky top-14 z-30 flex items-center justify-between border-b border-line bg-offwhite site-padding py-3 text-label">
        <span data-testid="plp-count">{filtered.length} items</span>
        <button
          type="button"
          className="flex items-center gap-2 uppercase tracking-[0.08em]"
          onClick={() => setPanelOpen(true)}
          data-testid="open-filters"
        >
          <FilterIcon className="h-4 w-4" />
          Sort &amp; filters{activeCount ? ` (${activeCount})` : ""}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-3 lg:grid-cols-4">
        {filtered.slice(0, visible).map((product, index) => (
          <ProductTile key={product.code} product={product} priority={index < 4} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">No products match the selected filters.</p>
      ) : null}

      {visible < filtered.length ? (
        <div className="flex justify-center py-10">
          <button
            type="button"
            className="btn-secondary w-auto"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            data-testid="show-more"
          >
            Show more ({Math.min(visible, filtered.length)}/{filtered.length})
          </button>
        </div>
      ) : null}

      {panelOpen ? (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-label="Sort and filters">
          <div className="flex-1 bg-black/40" onClick={() => setPanelOpen(false)} />
          <aside className="flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white animate-slide-in-right">
            <div className="flex h-14 items-center justify-between border-b border-line px-4">
              <span className="text-label uppercase tracking-[0.12em]">Sort &amp; filters</span>
              <button type="button" aria-label="Close filters" onClick={() => setPanelOpen(false)}>
                <CloseIcon />
              </button>
            </div>

            <div className="space-y-8 p-4">
              <div>
                <p className="eyebrow mb-3">Sort by</p>
                <div className="space-y-2">
                  {SORTS.map((option) => (
                    <label key={option.value} className="flex items-center gap-3 text-sm">
                      <input
                        type="radio"
                        name="sort"
                        checked={sort === option.value}
                        onChange={() => setSort(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="eyebrow mb-3">Size</p>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggle(sizes, setSizes, size)}
                      aria-pressed={sizes.includes(size)}
                      className={`border px-3 py-2 text-tiny ${
                        sizes.includes(size) ? "border-ink bg-ink text-white" : "border-line"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="eyebrow mb-3">Color</p>
                <div className="flex flex-wrap gap-2">
                  {allColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggle(colors, setColors, color)}
                      aria-pressed={colors.includes(color)}
                      className={`border px-3 py-2 text-tiny ${
                        colors.includes(color) ? "border-ink bg-ink text-white" : "border-line"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={onSaleOnly}
                  onChange={(event) => {
                    setOnSaleOnly(event.target.checked);
                    setVisible(PAGE_SIZE);
                  }}
                />
                On sale only
              </label>
            </div>

            <div className="mt-auto flex gap-3 border-t border-line p-4">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setSizes([]);
                  setColors([]);
                  setOnSaleOnly(false);
                  setSort("recommended");
                }}
              >
                Clear
              </button>
              <button type="button" className="btn-primary" onClick={() => setPanelOpen(false)}>
                Show {filtered.length} items
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
