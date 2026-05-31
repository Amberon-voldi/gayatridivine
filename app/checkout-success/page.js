'use client';

import Link from 'next/link';

export default function CheckoutSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been successfully placed.</p>
        <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
