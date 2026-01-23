"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  digitsOnly,
  formatIndianPhoneForInput,
  validateIndianMobile10,
  validatePincode6,
} from "@/lib/validation";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart, isLoaded } = useCart();
  const { user, isAuthenticated, addOrder } = useAuth();

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [settings, setSettings] = useState(null);

  const [phoneVerification, setPhoneVerification] = useState({
    verified: false,
    reqId: null,
    otp: "",
    sending: false,
    verifying: false,
    message: "",
    error: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    phone: "",
    pincode: "",
  });

  const [formData, setFormData] = useState({
    email: user?.email || "",
    phone: formatIndianPhoneForInput(user?.phone || ""),
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: ""
  });

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
          // Set default payment method based on what's enabled
          if (data.settings.payment?.razorpayEnabled) {
            setFormData(prev => ({ ...prev, paymentMethod: "razorpay" }));
          } else if (data.settings.payment?.codEnabled) {
            setFormData(prev => ({ ...prev, paymentMethod: "cod" }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const normalizePhoneForMsg91 = (phone) => {
    const raw = String(phone || "").trim();
    if (!raw) return "";

    // Strip all non-digits first.
    let digits = raw.replace(/\D/g, "");
    if (!digits) return "";

    // Remove leading trunk zeros or international leading zeros (e.g. 0..., 00...)
    digits = digits.replace(/^0+/, "").replace(/^00/, "");

    // If it already starts with country code 91, keep as-is (no plus)
    if (digits.startsWith("91")) return digits;

    // If user entered a 10-digit local number, prefix with 91
    if (digits.length === 10) return `91${digits}`;

    // Fallback: return digits without any plus sign; upstream will validate and return an error if needed.
    return digits;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const nextValue =
      name === "phone" || name === "pincode" ? digitsOnly(value) : value;

    setFormData({ ...formData, [name]: nextValue });

    if (name === "phone" || name === "pincode") {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "phone") {
      setPhoneVerification((prev) => ({
        ...prev,
        verified: false,
        reqId: null,
        otp: "",
        message: "",
        error: "",
      }));
    }
  };

  const sendPhoneOtp = async () => {
    const phoneError = validateIndianMobile10(formData.phone);
    if (phoneError) {
      setFieldErrors((prev) => ({ ...prev, phone: phoneError }));
      setPhoneVerification((prev) => ({ ...prev, error: phoneError }));
      return;
    }

    const identifier = `91${digitsOnly(formData.phone)}`;

    try {
      setPhoneVerification((prev) => ({
        ...prev,
        sending: true,
        error: "",
        message: "Sending OTP...",
      }));

      const res = await fetch("/api/msg91/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const json = await res.json();
      if (!json?.success) {
        throw new Error(
          json?.error || json?.data?.message || json?.data?.msg || "Failed to send OTP"
        );
      }

      const reqId =
        json?.reqId ||
        json?.data?.reqId ||
        json?.data?.reqID ||
        json?.data?.requestId ||
        json?.data?.requestID ||
        json?.data?.data?.reqId ||
        json?.data?.data?.reqID ||
        null;

      if (!reqId) {
        throw new Error("MSG91 did not return reqId. Please try again.");
      }

      setPhoneVerification((prev) => ({
        ...prev,
        reqId,
        sending: false,
        message: "OTP sent. Please enter the OTP.",
        error: "",
      }));
    } catch (err) {
      const message = err?.message || "Failed to send OTP";
      setPhoneVerification((prev) => ({
        ...prev,
        sending: false,
        message: "",
        error: /captcha/i.test(message)
          ? "OTP widget requires captcha. Disable captcha in MSG91 widget settings or implement captcha token passing."
          : message,
      }));
    }
  };

  const verifyPhoneOtp = async () => {
    if (!phoneVerification.reqId) {
      setPhoneVerification((prev) => ({ ...prev, error: "Please send OTP first" }));
      return;
    }

    const otp = String(phoneVerification.otp || "").trim();
    if (!otp) {
      setPhoneVerification((prev) => ({ ...prev, error: "Enter the OTP" }));
      return;
    }

    try {
      setPhoneVerification((prev) => ({
        ...prev,
        verifying: true,
        error: "",
        message: "Verifying OTP...",
      }));

      const res = await fetch("/api/msg91/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reqId: phoneVerification.reqId, otp }),
      });

      const json = await res.json();
      if (!json?.success) {
        throw new Error(json?.data?.message || json?.error || "OTP verification failed");
      }

      setPhoneVerification((prev) => ({
        ...prev,
        verified: true,
        verifying: false,
        message: "Phone number verified.",
        error: "",
      }));
    } catch (err) {
      setPhoneVerification((prev) => ({
        ...prev,
        verifying: false,
        message: "",
        error: err?.message || "OTP verification failed",
      }));
    }
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 1500 ? 0 : 99;
  const total = subtotal + shipping;

  const createRazorpayOrder = async () => {
    try {
      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          currency: "INR",
          receipt: `order_${Date.now()}`
        })
      });
      const data = await response.json();
      if (data.success) {
        return data.order;
      }
      throw new Error(data.error || "Failed to create order");
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      throw error;
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      const response = await fetch("/api/razorpay/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData)
      });
      return await response.json();
    } catch (error) {
      console.error("Error verifying payment:", error);
      return { success: false, error: error.message };
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      setIsProcessing(true);
      const razorpayOrder = await createRazorpayOrder();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Gayatri Divine",
        description: "Purchase from Gayatri Divine",
        image: "/logo.png",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          const verification = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          if (verification.success) {
            await completeOrder("razorpay", response.razorpay_payment_id);
          } else {
            alert("Payment verification failed. Please contact support.");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone
        },
        notes: {
          address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`
        },
        theme: {
          color: "#dc2626"
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        alert(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error) {
      console.error("Razorpay payment error:", error);
      alert("Failed to initiate payment. Please try again.");
      setIsProcessing(false);
    }
  };

  const completeOrder = async (paymentMethod, paymentId = null) => {
    const order = {
      items: cart,
      total,
      subtotal,
      shipping,
      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      },
      contactEmail: formData.email,
      contactPhone: formData.phone,
      paymentMethod,
      paymentId,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid"
    };

    if (isAuthenticated) {
      const result = await addOrder(order);
      if (result.success) {
        setOrderDetails(result.order);
      }
    } else {
      setOrderDetails({
        ...order,
        id: Date.now(),
        orderNumber: `GD${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: "confirmed"
      });
    }

    clearCart();
    setIsProcessing(false);
    setOrderPlaced(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step < 3) {
      if (step === 1) {
        const phoneError = validateIndianMobile10(formData.phone);
        if (phoneError) {
          setFieldErrors((prev) => ({ ...prev, phone: phoneError }));
          setPhoneVerification((prev) => ({ ...prev, error: phoneError }));
          return;
        }
      }

      if (step === 1 && !phoneVerification.verified) {
        setPhoneVerification((prev) => ({
          ...prev,
          error: "Please verify your phone number to continue.",
        }));
        return;
      }

      // Defensive: if state somehow advances without verification, send user back.
      if (step === 2 && !phoneVerification.verified) {
        setPhoneVerification((prev) => ({
          ...prev,
          error: "Please verify your phone number to continue.",
        }));
        setStep(1);
        return;
      }

      if (step === 2) {
        const pincodeError = validatePincode6(formData.pincode);
        if (pincodeError) {
          setFieldErrors((prev) => ({ ...prev, pincode: pincodeError }));
          return;
        }
      }

      setStep(step + 1);
      return;
    }

    if (formData.paymentMethod === "razorpay") {
      handleRazorpayPayment();
    } else if (formData.paymentMethod === "cod") {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await completeOrder("cod");
    }
  };

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some items to your cart before checkout.</p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-2">Thank you for shopping with Gayatri Divine.</p>
        {orderDetails && (
          <p className="text-gray-600 mb-6">
            Order Number: <span className="font-semibold">{orderDetails.orderNumber}</span>
          </p>
        )}
        <p className="text-gray-600 mb-8">
          We have sent a confirmation email to <span className="font-semibold">{formData.email}</span>
        </p>
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

  return (
    <div>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link href="/" className="text-gray-500 hover:text-red-600">Home</Link>
          <span className="text-gray-400">/</span>
          <Link href="/cart" className="text-gray-500 hover:text-red-600">Cart</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">Checkout</span>
        </nav>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[
            { num: 1, label: "Contact" },
            { num: 2, label: "Shipping" },
            { num: 3, label: "Payment" }
          ].map((s, index) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                step >= s.num ? "bg-red-600 text-white" : "bg-gray-200 text-gray-600"
              }`}>
                {step > s.num ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : s.num}
              </div>
              <span className={`ml-2 text-sm ${step >= s.num ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                {s.label}
              </span>
              {index < 2 && (
                <div className={`w-12 sm:w-24 h-1 mx-3 rounded ${step > s.num ? "bg-red-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Contact */}
              {step === 1 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h2>
                  
                  {!isAuthenticated && (
                    <p className="text-sm text-gray-600 mb-6">
                      Already have an account?{" "}
                      <Link href="/login?redirect=/checkout" className="text-red-600 hover:text-red-700">
                        Login
                      </Link>
                    </p>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      {fieldErrors.phone && (
                        <p className="mt-2 text-xs text-red-700">{fieldErrors.phone}</p>
                      )}

                      <div className="mt-3 rounded-lg border border-gray-200 p-4 bg-gray-50">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Verify phone via OTP</p>
                            <p className="text-xs text-gray-600">
                              Required to continue.
                            </p>
                          </div>

                          {phoneVerification.verified ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                              Verified
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={sendPhoneOtp}
                              disabled={phoneVerification.sending || !formData.phone}
                              className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
                            >
                              {phoneVerification.sending ? "Sending..." : "Send OTP"}
                            </button>
                          )}
                        </div>

                        {!phoneVerification.verified && phoneVerification.reqId && (
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={phoneVerification.otp}
                                onChange={(e) =>
                                  setPhoneVerification((prev) => ({
                                    ...prev,
                                    otp: e.target.value,
                                    error: "",
                                  }))
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={verifyPhoneOtp}
                              disabled={phoneVerification.verifying}
                              className="sm:col-span-1 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
                            >
                              {phoneVerification.verifying ? "Verifying..." : "Verify OTP"}
                            </button>
                          </div>
                        )}

                        {phoneVerification.message && (
                          <p className="mt-3 text-xs text-gray-700">{phoneVerification.message}</p>
                        )}
                        {phoneVerification.error && (
                          <p className="mt-3 text-xs text-red-700">{phoneVerification.error}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!phoneVerification.verified}
                    className="mt-6 w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
                  >
                    Continue to Shipping
                  </button>

                  {!phoneVerification.verified && (
                    <p className="mt-3 text-xs text-gray-600">
                      Verify your phone number via OTP to continue.
                    </p>
                  )}
                </div>
              )}

              {/* Step 2: Shipping */}
              {step === 2 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Shipping Address</h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        {fieldErrors.pincode && (
                          <p className="mt-2 text-xs text-red-700">{fieldErrors.pincode}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Method</h2>

                  <div className="space-y-4">
                    {/* Razorpay - Online Payment */}
                    {settings?.payment?.razorpayEnabled && (
                      <>
                        <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.paymentMethod === "razorpay" ? "border-red-600 bg-red-50" : "border-gray-300"
                        }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="razorpay"
                            checked={formData.paymentMethod === "razorpay"}
                            onChange={handleChange}
                            className="text-red-600 focus:ring-red-500"
                          />
                          <span className="ml-3 flex-1">
                            <span className="block font-medium text-gray-900">Pay Online</span>
                            <span className="block text-sm text-gray-500">UPI, Cards, Net Banking, Wallets</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <img src="https://cdn.razorpay.com/static/assets/logo/payment.svg" alt="Razorpay" className="h-6" />
                          </div>
                        </label>
                        {formData.paymentMethod === "razorpay" && (
                          <div className="ml-7 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-3">
                              You will be redirected to Razorpay secure payment gateway to complete your payment.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-white border rounded text-xs text-gray-600">UPI</span>
                              <span className="px-2 py-1 bg-white border rounded text-xs text-gray-600">Credit Card</span>
                              <span className="px-2 py-1 bg-white border rounded text-xs text-gray-600">Debit Card</span>
                              <span className="px-2 py-1 bg-white border rounded text-xs text-gray-600">Net Banking</span>
                              <span className="px-2 py-1 bg-white border rounded text-xs text-gray-600">Wallets</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* COD */}
                    {settings?.payment?.codEnabled && (
                      <>
                        {total > (settings?.payment?.codLimit || 0) && settings?.payment?.razorpayEnabled ? (
                          <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 opacity-60">
                            <div className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <div className="flex-1">
                                <span className="block font-medium text-gray-700">Cash on Delivery - Not Available</span>
                                <span className="block text-sm text-gray-600">COD is only available for orders up to ₹{settings?.payment?.codLimit?.toLocaleString('en-IN')}. Please use online payment.</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                            formData.paymentMethod === "cod" ? "border-red-600 bg-red-50" : "border-gray-300"
                          }`}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="cod"
                              checked={formData.paymentMethod === "cod"}
                              onChange={handleChange}
                              className="text-red-600 focus:ring-red-500"
                            />
                            <span className="ml-3">
                              <span className="block font-medium text-gray-900">Cash on Delivery</span>
                              <span className="block text-sm text-gray-500">Pay when you receive your order</span>
                            </span>
                          </label>
                        )}
                      </>
                    )}

                    {/* No payment methods enabled */}
                    {!settings?.payment?.razorpayEnabled && !settings?.payment?.codEnabled && (
                      <div className="p-4 border border-yellow-300 rounded-lg bg-yellow-50">
                        <p className="text-sm text-yellow-800">
                          Payment methods are currently unavailable. Please contact support.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isProcessing ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : formData.paymentMethod === "razorpay" ? (
                        `Pay ₹${total.toLocaleString()}`
                      ) : (
                        `Place Order - ₹${total.toLocaleString()}`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                      {item.selectedColor && (
                        <p className="text-xs text-gray-500">{item.selectedColor}</p>
                      )}
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

