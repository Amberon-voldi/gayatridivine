import Link from "next/link";

export default function FAQPage() {
  const faqs = [
    {
      category: "Orders & Shipping",
      questions: [
        {
          q: "How long does delivery take?",
          a: "Standard delivery takes 5-7 business days. Express delivery (2-3 days) and same-day delivery (in select cities) are also available at checkout."
        },
        {
          q: "Do you offer free shipping?",
          a: "Yes! We offer free standard shipping on all orders above ₹1,500. For orders below ₹1,500, a flat shipping fee of ₹99 applies."
        },
        {
          q: "How can I track my order?",
          a: "Once your order is shipped, you'll receive an email with tracking details. You can also track your order by logging into your account and visiting the 'My Orders' section."
        },
        {
          q: "Can I change my delivery address after placing an order?",
          a: "You can change your delivery address within 1 hour of placing the order. Please contact our support team immediately if you need to make changes."
        }
      ]
    },
    {
      category: "Returns & Refunds",
      questions: [
        {
          q: "What is your return policy?",
          a: "We offer a 7-day return policy for unused items in original packaging with all tags attached. Visit our Returns page for detailed information."
        },
        {
          q: "How do I initiate a return?",
          a: "Login to your account, go to 'My Orders', select the item you want to return, choose a reason, and schedule a free pickup."
        },
        {
          q: "How long does the refund take?",
          a: "Once we receive and verify your returned item, refunds are processed within 5-7 business days depending on your payment method."
        },
        {
          q: "Can I exchange a product?",
          a: "Yes! We offer free exchanges within 7 days of delivery. You can exchange for a different color or variant of the same product."
        }
      ]
    },
    {
      category: "Products",
      questions: [
        {
          q: "Are your products genuine leather?",
          a: "We offer both genuine leather and high-quality vegan leather options. Each product page clearly mentions the material used."
        },
        {
          q: "How do I care for my leather product?",
          a: "Keep leather products away from direct sunlight and moisture. Use a soft cloth for cleaning and apply leather conditioner occasionally for longevity."
        },
        {
          q: "Do your products come with warranty?",
          a: "All our products come with a 6-month warranty against manufacturing defects. This doesn't cover normal wear and tear or damage caused by misuse."
        },
        {
          q: "Are the product colors accurate?",
          a: "We try our best to display accurate colors. However, colors may vary slightly due to different screen settings. Check multiple product images for better understanding."
        }
      ]
    },
    {
      category: "Payment",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, Rupay), Net Banking, and Cash on Delivery."
        },
        {
          q: "Is Cash on Delivery available?",
          a: "Yes, COD is available for orders up to ₹5,000. COD orders have a small convenience fee of ₹50."
        },
        {
          q: "Is it safe to pay online on your website?",
          a: "Absolutely! We use industry-standard SSL encryption and secure payment gateways. We never store your card details on our servers."
        },
        {
          q: "Can I pay with EMI?",
          a: "Yes, EMI options are available on orders above ₹3,000 for select credit cards. Check EMI options at checkout."
        }
      ]
    },
    {
      category: "Account",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click on the user icon in the header and select 'Create Account'. Fill in your details and you're ready to shop!"
        },
        {
          q: "Can I order without creating an account?",
          a: "Yes, you can checkout as a guest. However, creating an account lets you track orders, save addresses, and earn rewards."
        },
        {
          q: "I forgot my password. What should I do?",
          a: "Click on 'Forgot Password' on the login page, enter your email, and we'll send you a link to reset your password."
        },
        {
          q: "How do I delete my account?",
          a: "Go to Account Settings > Profile and click 'Delete Account'. Please note this action is irreversible."
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm mb-8">
        <Link href="/" className="text-gray-500 hover:text-red-600">Home</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900">FAQ</span>
      </nav>

      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-600">Find answers to common questions about shopping at Gayatri Divine</p>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {faqs.map(section => (
          <a
            key={section.category}
            href={`#${section.category.toLowerCase().replace(/\s+/g, '-')}`}
            className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 hover:bg-red-100 hover:text-red-700 transition-colors shadow-sm"
          >
            {section.category}
          </a>
        ))}
      </div>

      {/* FAQ Sections */}
      <div className="space-y-12">
        {faqs.map(section => (
          <section key={section.category} id={section.category.toLowerCase().replace(/\s+/g, '-')}>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {section.category}
            </h2>
            <div className="space-y-4">
              {section.questions.map((faq, index) => (
                <details key={index} className="bg-white rounded-xl shadow-sm group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Still Need Help */}
      <div className="mt-16 bg-gradient-to-r from-red-600 to-pink-500 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
        <p className="mb-6 opacity-90">Our support team is ready to help you</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact" className="px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
            Contact Support
          </Link>
          <a href="tel:+919876543210" className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
            Call Us
          </a>
        </div>
      </div>
    </div>
  );
}

