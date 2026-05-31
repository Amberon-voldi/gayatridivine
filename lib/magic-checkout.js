/**
 * Build order payload from cart for Magic Checkout create-order API.
 */
export function formatContactForRazorpay(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("+")) return digits;
  return `+${digits}`;
}

export function mapRazorpayOrderToLocalOrder({
  razorpayOrder,
  cart,
  paymentMethod,
  paymentId,
  paymentMeta,
}) {
  const customer = razorpayOrder?.customer_details || {};
  const shippingAddr = customer.shipping_address || customer.billing_address || {};

  const subtotal =
    cart?.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;
  const shippingFeeRupees = (razorpayOrder?.shipping_fee ?? 0) / 100;
  const codFeeRupees = (razorpayOrder?.cod_fee ?? 0) / 100;
  const totalFromRzp = (razorpayOrder?.amount ?? 0) / 100;
  const total =
    totalFromRzp > 0
      ? totalFromRzp
      : subtotal + shippingFeeRupees + codFeeRupees;

  const line1 = shippingAddr.line1 || "";
  const line2 = shippingAddr.line2 || "";
  const address = [line1, line2].filter(Boolean).join(", ");

  const isCod =
    paymentMethod === "cod" ||
    razorpayOrder?.status === "placed" ||
    (razorpayOrder?.amount_paid === 0 && razorpayOrder?.status !== "paid");

  return {
    items: cart,
    subtotal,
    shipping: shippingFeeRupees,
    total,
    shippingAddress: {
      name: shippingAddr.name || customer.name || "",
      address: address || shippingAddr.line1 || "",
      city: shippingAddr.city || "",
      state: shippingAddr.state || "",
      pincode: shippingAddr.zipcode || "",
      phone: (shippingAddr.contact || customer.contact || "").replace(/^\+91/, ""),
    },
    customerName: shippingAddr.name || customer.name || "",
    contactEmail: customer.email || "",
    contactPhone: (customer.contact || shippingAddr.contact || "").replace(
      /^\+91/,
      ""
    ),
    paymentMethod: isCod ? "cod" : paymentMethod || "razorpay",
    paymentId: paymentId || null,
    paymentStatus: isCod ? "pending" : "paid",
    razorpayOrderId: paymentMeta?.razorpayOrderId || razorpayOrder?.id || null,
    razorpayPaymentId: paymentMeta?.razorpayPaymentId || paymentId || null,
    razorpaySignature: paymentMeta?.razorpaySignature || null,
  };
}
