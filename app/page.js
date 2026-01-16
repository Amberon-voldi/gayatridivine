"use client";

import { useEffect, useMemo, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { listAllProducts } from "@/lib/products";
import { deriveCategoriesFromProducts, listCategories } from "@/lib/categories";

function ProductsContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "all";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const items = await listAllProducts();

        if (cancelled) return;
        setProducts(items);

        try {
          const cats = await listCategories({ onlyActive: true });
          if (!cancelled) setCategories(cats);
        } catch (e) {
          // If the categories collection isn't set up yet, derive from product.category values.
          if (!cancelled) setCategories(deriveCategoriesFromProducts(items));
        }
      } catch (e) {
        console.error("Failed to load products:", e);
        if (!cancelled) setError(e?.message || "Failed to load products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (categoryParam && categoryParam !== "all") {
      result = result.filter((p) => String(p.category || "") === String(categoryParam));
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        String(p.category || "").toLowerCase().includes(query)
      );
    }

    return result;
  }, [searchQuery, categoryParam, products]);

  const categoryLinks = useMemo(() => {
    const unique = new Map();

    // Always include all
    unique.set("all", { id: "all", name: "All" });

    for (const c of categories || []) {
      const id = String(c?.id || c?.slug || c?.name || "").trim();
      if (!id || id === "all") continue;
      const label = String(c?.name || id).trim();
      unique.set(id, { id, name: label });
    }

    // If categories come from Appwrite docs, id is doc.$id; but our product.category is a string.
    // For best compatibility, prefer showing/using the raw category value used in products.
    // When deriveCategoriesFromProducts is used, id == product.category.
    return Array.from(unique.values());
  }, [categories]);

  const buildCategoryHref = (categoryId) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!categoryId || categoryId === "all") {
      params.delete("category");
    } else {
      params.set("category", categoryId);
    }
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl aspect-square"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Couldn’t load products</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <a href="/" className="text-red-600 hover:text-red-700 font-medium">
          Retry
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Categories */}
      {categoryLinks.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {categoryLinks.map((c) => {
            const active = (categoryParam || "all") === c.id;
            return (
              <a
                key={c.id}
                href={buildCategoryHref(c.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-red-300 hover:text-red-700"
                }`}
              >
                {c.name}
              </a>
            );
          })}
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or search query</p>
          <a href="/" className="text-red-600 hover:text-red-700 font-medium">
            View all products
          </a>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-8"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl aspect-square"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}

