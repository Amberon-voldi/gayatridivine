"use client";

import { useCallback, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  formatContactForRazorpay,
  mapRazorpayOrderToLocalOrder,
} from "@/lib/magic-checkout";

const MAGIC_CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/magic-checkout.js";

export default function MagicCheckoutButton({
  cart,
  settings,
  razorpayKeyId,
  className = "",
  disabled = false,
  label = "Razorpay Checkout",
}) {
  const router = useRouter();
  const { clearCart } = useCart();
  const { user, isAuthenticated, addOrder } = useAuth();
  const [scriptReady, setScriptReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const keyId = razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  const loadExternalScript = (src) =>
    new Promise((resolve, reject) => {
      if (typeof window === "undefined") return reject(new Error("no-window"));
      if (window.Razorpay) return resolve();
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.getAttribute("data-loaded") === "true") return resolve();
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("failed to load")));
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => {
        s.setAttribute("data-loaded", "true");
        resolve();
      };
      s.onerror = () => reject(new Error("failed to load"));
      document.body.appendChild(s);
    });

  const ensureRazorpayReady = async (timeout = 3000) => {
    if (typeof window === "undefined") return false;
    if (window.Razorpay) {
      setScriptReady(true);
      return true;
    }

    try {
      await Promise.race([
        loadExternalScript(MAGIC_CHECKOUT_SCRIPT),
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), timeout)),
      ]);
      if (window.Razorpay) {
        setScriptReady(true);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const verifyPayment = async (paymentData) => {
    console.log("[MagicCheckout] verifyPayment payload:", paymentData);
    const response = await fetch("/api/razorpay/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });
    return response.json();
  };

  const fetchRazorpayOrder = async (orderId) => {
    console.log("[MagicCheckout] fetching razorpay order:", orderId);
    const response = await fetch(
      `/api/razorpay/fetch-order?orderId=${encodeURIComponent(orderId)}`
    );
    const data = await response.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch order");
    return data.order;
  };

  const persistOrder = async (localOrder) => {
    console.log("[MagicCheckout] persisting order, isAuthenticated:", isAuthenticated, "order:", localOrder);
    if (isAuthenticated) {
      const result = await addOrder(localOrder);
      if (!result?.success) {
        throw new Error(result?.error || "Failed to save order");
      }
      return result.order;
    }

    const guestOrder = {
      ...localOrder,
      id: Date.now(),
      orderNumber: `GD${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "confirmed",
    };

    try {
      sessionStorage.setItem(
        "gayatri-divine-last-order",
        JSON.stringify(guestOrder)
      );
    } catch {
      /* ignore storage errors */
    }

    return guestOrder;
  };

  const handlePaymentSuccess = useCallback(
    async (response, cartSnapshot) => {
      console.log("[MagicCheckout] payment handler response:", response);
      const verification = await verifyPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });

      console.log("[MagicCheckout] verification result:", verification);
      if (!verification.success) {
        throw new Error("Payment verification failed");
      }

      const razorpayOrder = await fetchRazorpayOrder(response.razorpay_order_id);
      console.log("[MagicCheckout] fetched razorpay order:", razorpayOrder?.id);
      const localOrder = mapRazorpayOrderToLocalOrder({
        razorpayOrder,
        cart: cartSnapshot,
        paymentMethod: "razorpay",
        paymentId: response.razorpay_payment_id,
        paymentMeta: {
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        },
      });

      const saved = await persistOrder(localOrder);
      console.log("[MagicCheckout] order saved:", saved?.orderNumber || saved?.id || "guest");
      clearCart();
      const orderNumber = saved?.orderNumber || `GD${Date.now()}`;
      router.push(
        `/checkout/success?orderNumber=${encodeURIComponent(orderNumber)}`
      );
    },
    [addOrder, clearCart, isAuthenticated, router]
  );

  const openMagicCheckout = async () => {
    if (!keyId) {
      setError("Payment is not configured. Please try again later.");
      return;
    }

    // Ensure the Razorpay script is available (try fast fallback loader)
    const ready = await ensureRazorpayReady(2000);
    if (!ready) {
      setError("Checkout is still loading. Please try again.");
      setIsProcessing(false);
      return;
    }

    if (!settings?.payment?.razorpayEnabled) {
      setError("Online checkout is currently unavailable.");
      return;
    }

    setError("");
    setIsProcessing(true);

    const cartSnapshot = cart.map((item) => ({ ...item }));

    try {
      const createRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: cartSnapshot }),
      });
      const createData = await createRes.json();

      if (!createData.success) {
        throw new Error(createData.error || "Failed to create order");
      }

      const { order } = createData;
      const storeName = settings?.store?.storeName || "Gayatri Divine";

      const prefill = {};
      if (user?.name) prefill.name = user.name;
      if (user?.email) prefill.email = user.email;
      const phone =
        user?.phone || user?.prefs?.phone || settings?.store?.storePhone;
      const contact = formatContactForRazorpay(phone);
      if (contact) prefill.contact = contact;

      const options = {
        key: keyId,
        one_click_checkout: true,
        name: storeName,
        order_id: order.id,
        show_coupons: true,
        image: settings?.store?.logoPath || "/logo.png",
        prefill,
        theme: { color: "#dc2626" },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
        handler: async (response) => {
          try {
            await handlePaymentSuccess(response, cartSnapshot);
          } catch (err) {
            console.error("Magic Checkout completion error:", err);
            alert(
              err?.message ||
                "Payment succeeded but we could not complete your order. Please contact support with your payment ID."
            );
            setIsProcessing(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        alert(
          resp?.error?.description ||
            "Payment failed. Please try again."
        );
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Magic Checkout error:", err);
      setError(err?.message || "Could not start checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Script
        src={MAGIC_CHECKOUT_SCRIPT}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => setError("Failed to load payment checkout.")}
      />
      <button
        type="button"
        onClick={openMagicCheckout}
        disabled={disabled || isProcessing || !cart?.length}
        className={
          className ||
          "w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center"
        }
      >
        {isProcessing ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Opening checkout…
          </span>
        ) : (
          label
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
