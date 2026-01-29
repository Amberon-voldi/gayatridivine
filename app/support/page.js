import Link from "next/link";

export const metadata = {
  title: "Support | Gayatri Divine",
  description: "Get help with orders, shipping, returns, and account support.",
};

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Support</h1>
        <p className="mt-2 text-gray-600">
          Need help with your order or have a question? We’re here to help.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/contact"
            className="block p-5 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15a4 4 0 01-4 4H7l-4 3V7a4 4 0 014-4h10a4 4 0 014 4v8z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Contact Support</p>
                <p className="text-sm text-gray-600">Send us a message</p>
              </div>
            </div>
          </Link>

          <Link
            href="/faq"
            className="block p-5 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">FAQs</p>
                <p className="text-sm text-gray-600">Quick answers</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900">Order help</h2>
          <p className="mt-1 text-sm text-gray-600">
            For order status, shipping updates, or returns, please include your order number when you contact us.
          </p>
        </div>
        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900">Product questions</h2>
          <div className="mt-3 text-sm text-gray-600 space-y-3">
            <details className="bg-white rounded-lg p-3">
              <summary className="font-medium cursor-pointer">What kinds of products do you sell?</summary>
              <p className="mt-2">We specialize in spiritual and ritual items such as rudraksha beads, yantras, japa (mantra) malas, prayer beads, and related accessories. We do not sell wallets or general fashion accessories.</p>
            </details>

            <details className="bg-white rounded-lg p-3">
              <summary className="font-medium cursor-pointer">Are your spiritual items authentic?</summary>
              <p className="mt-2">Yes — we source items from trusted suppliers. Product pages include details about origin, material, and authenticity where available.</p>
            </details>

            <details className="bg-white rounded-lg p-3">
              <summary className="font-medium cursor-pointer">How should I care for these items?</summary>
              <p className="mt-2">Keep items clean and dry, avoid harsh chemicals, and store them in a cloth bag or box. Follow care instructions on each product page.</p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
