import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm mb-8">
        <Link href="/" className="text-gray-500 hover:text-red-600">Home</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900">Privacy Policy</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
      <p className="text-gray-600 mb-8">Last updated: January 11, 2026</p>

      <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
          <p className="text-gray-600">
            Welcome to Gayatri Divine. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy explains how we collect, use, and safeguard your information when you visit our website 
            or make a purchase.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
          <p className="text-gray-600 mb-4">We collect information that you provide directly to us, including:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Personal identification information (name, email address, phone number)</li>
            <li>Billing and shipping addresses</li>
            <li>Payment information (processed securely through our payment partners)</li>
            <li>Order history and preferences</li>
            <li>Communications and correspondence with us</li>
          </ul>
          <p className="text-gray-600 mt-4">We also automatically collect certain information when you visit our website:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Device information (browser type, operating system)</li>
            <li>IP address and location data</li>
            <li>Browsing behavior and pages visited</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-600 mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about orders, products, and services</li>
            <li>Send promotional emails (with your consent)</li>
            <li>Improve our website and customer experience</li>
            <li>Detect and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
          <p className="text-gray-600 mb-4">
            We do not sell, trade, or rent your personal information to third parties. We may share your information with:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Service providers who assist in our operations (shipping, payment processing)</li>
            <li>Analytics partners to help us understand website usage</li>
            <li>Law enforcement when required by law</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
          <p className="text-gray-600">
            We implement appropriate security measures to protect your personal information against unauthorized access, 
            alteration, disclosure, or destruction. This includes SSL encryption, secure payment gateways, and regular 
            security assessments.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookies</h2>
          <p className="text-gray-600">
            We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and 
            personalize content. You can control cookie settings through your browser preferences.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
          <p className="text-gray-600 mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Withdraw consent where applicable</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
          <p className="text-gray-600">
            Our website is not intended for children under 18 years of age. We do not knowingly collect personal 
            information from children.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
          <p className="text-gray-600">
            We may update this privacy policy from time to time. We will notify you of any changes by posting the 
            new policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul className="text-gray-600 space-y-2">
            <li><strong>Email:</strong> gayatridivinestores@gmail.com</li>
            <li><strong>Phone:</strong> +91 9319918797, +91 9717029339</li>
            <li><strong>Address:</strong> 954, Badarpur New Delhi 110044</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

