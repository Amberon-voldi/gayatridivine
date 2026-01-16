"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { listCategories } from "@/lib/categories";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const { getCartCount, isLoaded } = useCart();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const cats = await listCategories({ onlyActive: true });
        if (!cancelled) setCategories(cats);
      } catch {
        if (!cancelled) setCategories([]);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-25">
          {/* Left: Logo */}
          <div className="flex-1">
            <Link href="/" className="flex items-center space-x-2">
              <img
                src="/logo.png"
                alt="Gayatri Divine"
                className="h-25 w-25 object-contain"
              />
            </Link>
          </div>

          {/* Center: Brand */}
          <div className="hidden md:flex flex-1 justify-center">
            <Link
              href="/"
              className="text-gray-900 font-semibold tracking-wide text-lg hover:text-red-600 transition-colors"
              aria-label="Gayatri Divine Home"
            >
              Gayatri Divine
            </Link>
          </div>

          {/* Right: Search, Account, Cart */}
          <div className="flex flex-1 items-center justify-end space-x-4">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-600 hover:text-red-600 transition-colors"
              aria-label="Search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Account */}
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              className="text-gray-600 hover:text-red-600 transition-colors"
              aria-label="Account"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative text-gray-600 hover:text-red-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {isLoaded && getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-600 hover:text-red-600 transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t">
            <form action="/" method="GET" className="relative">
              <input
                type="text"
                name="search"
                placeholder="Search products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-red-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                All Products
              </Link>

              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/?category=${encodeURIComponent(c.slug || c.id)}`}
                  className="text-gray-600 hover:text-red-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {c.name}
                </Link>
              ))}
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                className="text-gray-600 hover:text-red-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {isAuthenticated ? "My Account" : "Login / Register"}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

