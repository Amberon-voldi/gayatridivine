import Link from "next/link";

export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm mb-8">
        <Link href="/" className="text-gray-500 hover:text-purple-600">Home</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900">Shipping Information</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shipping Information</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 space-y-8">
        {/* Delivery Options */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Options</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 font-semibold text-gray-900">Method</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Delivery Time</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">Standard Delivery</td>
                  <td className="py-3 px-4">5-7 Business Days</td>
                  <td className="py-3 px-4">₹99 (Free above ₹1,500)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Express Delivery</td>
                  <td className="py-3 px-4">2-3 Business Days</td>
                  <td className="py-3 px-4">₹199</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Same Day Delivery*</td>
                  <td className="py-3 px-4">Same Day</td>
                  <td className="py-3 px-4">₹299</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-4">*Same day delivery available in select cities for orders placed before 12 PM</p>
        </section>

        {/* Serviceable Areas */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Serviceable Areas</h2>
          <p className="text-gray-600 mb-4">
            We currently deliver across India. Enter your pincode at checkout to check serviceability and estimated delivery time.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"].map(city => (
              <div key={city} className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{city}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Order Tracking */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Tracking</h2>
          <p className="text-gray-600">
            Once your order is shipped, you'll receive an email with tracking details. You can also track your order from your account dashboard.
          </p>
          <ol className="mt-4 space-y-3">
            <li className="flex items-start space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold shrink-0">1</span>
              <span className="text-gray-600">Order confirmed - We've received your order</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold shrink-0">2</span>
              <span className="text-gray-600">Processing - Your order is being prepared</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold shrink-0">3</span>
              <span className="text-gray-600">Shipped - Your package is on its way</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold shrink-0">4</span>
              <span className="text-gray-600">Delivered - Enjoy your purchase!</span>
            </li>
          </ol>
        </section>

        {/* Important Notes */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Important Notes</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start space-x-2">
              <span className="text-purple-600">•</span>
              <span>Delivery times may vary during sale periods and festivals</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-600">•</span>
              <span>Someone must be available to receive the package at the delivery address</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-600">•</span>
              <span>For COD orders, please keep the exact amount ready</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-600">•</span>
              <span>Contact our support team for any delivery-related queries</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
