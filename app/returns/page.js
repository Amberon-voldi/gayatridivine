import Link from "next/link";

export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm mb-8">
        <Link href="/" className="text-gray-500 hover:text-red-600">Home</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900">Returns & Exchange</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Returns & Exchange Policy</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 space-y-8">
        {/* Return Policy */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Return Policy</h2>
          <p className="text-gray-600 mb-4">
            We want you to love your purchase! If you're not completely satisfied, we offer a hassle-free 
            return policy to ensure your shopping experience is worry-free.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">7</div>
              <div className="text-gray-600">Days Return Window</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">Free</div>
              <div className="text-gray-600">Return Pickup</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">5-7</div>
              <div className="text-gray-600">Days Refund</div>
            </div>
          </div>
        </section>

        {/* Eligibility */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Return Eligibility</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-green-600 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Eligible for Return
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>â€¢ Unused items with all original tags</li>
                <li>â€¢ Items in original packaging</li>
                <li>â€¢ Items returned within 7 days of delivery</li>
                <li>â€¢ Defective or damaged items</li>
                <li>â€¢ Wrong item received</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-red-600 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Not Eligible for Return
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>â€¢ Used or altered items</li>
                <li>â€¢ Items without original tags/packaging</li>
                <li>â€¢ Items returned after 7 days</li>
                <li>â€¢ Sale items (final sale)</li>
                <li>â€¢ Personalized items</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How to Return */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Initiate a Return</h2>
          <ol className="space-y-4">
            <li className="flex items-start space-x-4">
              <span className="flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full font-semibold shrink-0">1</span>
              <div>
                <h3 className="font-medium text-gray-900">Login to Your Account</h3>
                <p className="text-gray-600 text-sm">Go to My Orders and select the item you want to return</p>
              </div>
            </li>
            <li className="flex items-start space-x-4">
              <span className="flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full font-semibold shrink-0">2</span>
              <div>
                <h3 className="font-medium text-gray-900">Select Return Reason</h3>
                <p className="text-gray-600 text-sm">Choose your reason for return and add any additional comments</p>
              </div>
            </li>
            <li className="flex items-start space-x-4">
              <span className="flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full font-semibold shrink-0">3</span>
              <div>
                <h3 className="font-medium text-gray-900">Schedule Pickup</h3>
                <p className="text-gray-600 text-sm">Choose a convenient date and time for free pickup</p>
              </div>
            </li>
            <li className="flex items-start space-x-4">
              <span className="flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full font-semibold shrink-0">4</span>
              <div>
                <h3 className="font-medium text-gray-900">Receive Refund</h3>
                <p className="text-gray-600 text-sm">Once we receive and verify the item, refund will be processed within 5-7 business days</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Exchange */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Exchange Policy</h2>
          <p className="text-gray-600 mb-4">
            Want a different color or size? We offer free exchanges within 7 days of delivery.
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start space-x-2">
              <span className="text-red-600">â€¢</span>
              <span>Same product, different color/variant - Free exchange</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-600">â€¢</span>
              <span>Exchange for higher value item - Pay the difference</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-600">â€¢</span>
              <span>Exchange for lower value item - Receive store credit for difference</span>
            </li>
          </ul>
        </section>

        {/* Refund Methods */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Refund Methods</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 font-semibold text-gray-900">Payment Method</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Refund Timeline</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">UPI / Net Banking</td>
                  <td className="py-3 px-4">3-5 Business Days</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Credit / Debit Card</td>
                  <td className="py-3 px-4">5-7 Business Days</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Cash on Delivery</td>
                  <td className="py-3 px-4">Bank Transfer in 7-10 Business Days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-gray-50 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h2>
          <p className="text-gray-600 mb-4">Our customer support team is here to assist you</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
              Contact Us
            </Link>
            
          </div>
        </section>
      </div>
    </div>
  );
}

