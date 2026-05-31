"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function SuccessContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [orderDetails, setOrderDetails] = useState(null);

  const orderNumberFromUrl = searchParams.get("orderNumber");

  useEffect(() => {
    if (orderNumberFromUrl) {
      setOrderDetails({ orderNumber: orderNumberFromUrl });
      return;
    }

    try {
      const raw = sessionStorage.getItem("gayatri-divine-last-order");
      if (raw) {
        setOrderDetails(JSON.parse(raw));
        sessionStorage.removeItem("gayatri-divine-last-order");
      }
    } catch {
      
    }
  }, [orderNumberFromUrl]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-10 h-10 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
        Order Placed Successfully!
      </h1>
      <p className="text-gray-600 mb-2">Thank you for shopping with Gayatri Divine.</p>
      {orderDetails?.orderNumber && (
        <p className="text-gray-600 mb-6">
          Order Number:{" "}
          <span className="font-semibold">{orderDetails.orderNumber}</span>
        </p>
      )}
      {orderDetails?.contactEmail && (
        <p className="text-gray-600 mb-8">
          Confirmation will be sent to{" "}
          <span className="font-semibold">{orderDetails.contactEmail}</span>
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/"
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Continue Shopping
        </Link>
        {isAuthenticated && (
          <Link
            href="/account/orders"
            className="px-6 py-3 border border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
          >
            View Orders
          </Link>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-16 flex justify-center">
          <div
            className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-red-600 animate-spin"
            aria-label="Loading"
          />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
