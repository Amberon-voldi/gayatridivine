"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && <Header />}
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
      {!isAdminPage && <Footer />}

      {!isAdminPage && (
        <Link
          href="/support"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-red-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Support"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 10a6 6 0 00-12 0v2a2 2 0 002 2h1v-6H8a4 4 0 018 0h-1v6h1a2 2 0 002-2v-2z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 18h6"
            />
          </svg>
          <span className="text-sm font-semibold">Support</span>
        </Link>
      )}
    </div>
  );
}
