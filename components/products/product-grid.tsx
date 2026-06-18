"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { categories } from "@/lib/product-catalog";
import { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

type Suggestion = {
  label: string;
  type: "Category" | "Product";
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

const productsPerPage = 12;

export function ProductGrid({ products, initialCategory = "All" }: { products: Product[]; initialCategory?: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = useMemo(() => {
    const searchTerm = normalize(query);

    return products.filter((product) => {
      const matchesQuery = !searchTerm || normalize(product.name).includes(searchTerm) || normalize(product.category).includes(searchTerm);
      const matchesCategory = category === "All" || product.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [products, query, category]);

  const suggestions = useMemo<Suggestion[]>(() => {
    const searchTerm = normalize(query);
    if (!searchTerm) return [];

    const productSuggestions = products
      .filter((product) => normalize(product.name).includes(searchTerm))
      .map((product) => ({ label: product.name, type: "Product" as const }));

    const allCategories = Array.from(new Set([...categories, ...products.map((product) => product.category)]));
    const categorySuggestions = allCategories
      .filter((item) => normalize(item).includes(searchTerm))
      .map((item) => ({ label: item, type: "Category" as const }));

    const seen = new Set<string>();
    return [...categorySuggestions, ...productSuggestions].filter((item) => {
      const key = normalize(item.label);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 8);
  }, [products, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / productsPerPage));
  const currentPage = Math.min(page, pageCount);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return filtered.slice(start, start + productsPerPage);
  }, [filtered, currentPage, productsPerPage]);

  useEffect(() => {
    console.log(
      [
        `ProductGrid: received ${products.length} product(s).`,
        `Filtered count: ${filtered.length}.`,
        `Paginated count: ${paginated.length}.`,
        `Page: ${currentPage}/${pageCount}.`,
        `Category: "${category}".`,
        `Search: "${query}".`
      ].join(" ")
    );
  }, [products.length, filtered.length, paginated.length, currentPage, pageCount, category, query]);

  useEffect(() => {
    setPage(1);
  }, [query, category]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  function chooseSuggestion(suggestion: Suggestion) {
    setQuery(suggestion.label);
    setCategory("All");
    setPage(1);
    setShowSuggestions(false);
  }

  return (
    <div>
      <div className="grid gap-3 rounded-lg border border-black/10 bg-white p-3 shadow-sm md:grid-cols-[1fr_260px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35" size={18} />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
            aria-label="Search products"
            placeholder="Search equipment, appliances, and merchandise"
            className="gold-ring h-12 w-full rounded-md border border-black/10 bg-white pl-11 pr-4 text-sm"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-black/10 bg-white shadow-premium">
              {suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.type}-${suggestion.label}`}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseSuggestion(suggestion)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition hover:bg-champagne"
                >
                  <span className="min-w-0 truncate font-medium text-ink">{suggestion.label}</span>
                  <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">{suggestion.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="gold-ring h-12 rounded-md border border-black/10 bg-white px-4 text-sm">
          <option>All</option>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-4">
        {paginated.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {!filtered.length && <p className="mt-10 rounded-lg border border-black/10 bg-white p-8 text-center text-black/60">No products match your search.</p>}
      {filtered.length > productsPerPage && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage === 1}
            className="gold-ring rounded-md border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-gold hover:bg-champagne disabled:cursor-not-allowed disabled:opacity-45"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-black/60">
            Page {currentPage} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            disabled={currentPage === pageCount}
            className="gold-ring rounded-md border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-gold hover:bg-champagne disabled:cursor-not-allowed disabled:opacity-45"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
