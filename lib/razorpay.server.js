import Razorpay from "razorpay";
import { readSettingsFile } from "@/lib/settings.server";

export function getRazorpayClient() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay is not configured: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET"
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export function getRazorpayKeyId() {
  return (
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY_ID ||
    ""
  );
}

export async function getStoreSettings() {
  return readSettingsFile();
}

export function computeShipping(subtotal, shippingSettings) {
  const freeShippingThreshold =
    shippingSettings?.freeShippingThreshold ?? 1500;
  const standardShippingRate = shippingSettings?.standardShippingRate ?? 99;
  const shipping =
    subtotal >= freeShippingThreshold ? 0 : standardShippingRate;
  return { shipping, freeShippingThreshold, standardShippingRate };
}

function absoluteImageUrl(image, siteOrigin) {
  if (!image) return `${siteOrigin}/logo.png`;
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  const path = image.startsWith("/") ? image : `/${image}`;
  return `${siteOrigin}${path}`;
}

export function buildVariantId(item) {
  const color = item.selectedColor || "default";
  return `${item.id}_${color}`.replace(/\s+/g, "-");
}

export function buildLineItems(cart, siteOrigin) {
  const origin =
    siteOrigin ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://gayatridivine.in";

  return cart.map((item) => {
    const unitPricePaise = Math.round(item.price * 100);
    const variantId = buildVariantId(item);
    return {
      sku: String(item.id),
      variant_id: variantId,
      price: unitPricePaise,
      offer_price: unitPricePaise,
      quantity: item.quantity,
      name: item.name,
      description: item.selectedColor
        ? `${item.name} (${item.selectedColor})`
        : item.name,
      image_url: absoluteImageUrl(item.image, origin),
      product_url: item.slug
        ? `${origin}/product/${item.slug}`
        : `${origin}/product/${item.id}`,
    };
  });
}

export function buildMagicCheckoutOrderPayload({
  cart,
  receipt,
  siteOrigin,
  shippingSettings,
  paymentSettings,
}) {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const { shipping } = computeShipping(subtotal, shippingSettings);
  const lineItems = buildLineItems(cart, siteOrigin);
  const lineItemsTotal = lineItems.reduce(
    (sum, item) => sum + item.offer_price * item.quantity,
    0
  );
  const shippingPaise = Math.round(shipping * 100);
  const amount = lineItemsTotal + shippingPaise;

  const codEnabled = paymentSettings?.codEnabled ?? false;
  const codLimit = paymentSettings?.codLimit ?? 10000;
  const totalRupees = amount / 100;
  const codAllowed = codEnabled && totalRupees <= codLimit;

  return {
    amount,
    currency: "INR",
    receipt,
    line_items_total: lineItemsTotal,
    line_items: lineItems,
    notes: {
      subtotal_paise: String(Math.round(subtotal * 100)),
      shipping_paise: String(shippingPaise),
      cod_allowed: codAllowed ? "true" : "false",
    },
    meta: { subtotal, shipping, totalRupees, codAllowed },
  };
}

export function buildShippingMethodsResponse({
  addressId,
  zipcode,
  shippingPaise,
  codAllowed,
  codFeePaise = 0,
}) {
  return {
    addresses: [
      {
        id: addressId,
        zipcode,
        country: "IN",
        shipping_methods: [
          {
            id: "0",
            name: shippingPaise === 0 ? "Free shipping" : "Standard delivery",
            description:
              shippingPaise === 0
                ? "Free shipping on your order"
                : "Delivered in 5–7 business days",
            serviceable: true,
            shipping_fee: shippingPaise,
            cod: codAllowed,
            cod_fee: codAllowed ? codFeePaise : 0,
          },
        ],
      },
    ],
  };
}
