import fs from "fs/promises";
import path from "path";

const SETTINGS_RELATIVE_PATH = path.join("data", "settings.json");

export function getSettingsFilePath() {
  return path.join(process.cwd(), SETTINGS_RELATIVE_PATH);
}

export async function readSettingsFile() {
  const filePath = getSettingsFilePath();
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

export async function writeSettingsFile(nextSettings) {
  const filePath = getSettingsFilePath();
  const json = JSON.stringify(nextSettings, null, 2) + "\n";
  await fs.writeFile(filePath, json, "utf8");
  return true;
}

export function sanitizeSettings(input) {
  // Minimal shape enforcement + coercion.
  const s = input && typeof input === "object" ? input : {};

  const num = (v, fallback) => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const bool = (v, fallback) => {
    if (typeof v === "boolean") return v;
    if (typeof v === "string") {
      if (v.toLowerCase() === "true") return true;
      if (v.toLowerCase() === "false") return false;
    }
    return fallback;
  };

  const str = (v, fallback = "") => (v == null ? fallback : String(v));

  const arrayOfStrings = (v) => {
    if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
    if (typeof v === "string") {
      return v
        .split(/[\n,]/)
        .map((x) => x.trim())
        .filter(Boolean);
    }
    return [];
  };

  const store = s.store || {};
  const shipping = s.shipping || {};
  const payment = s.payment || {};
  const gst = s.gst || {};
  const otp = s.otp || {};
  const admin = s.admin || {};

  return {
    store: {
      storeName: str(store.storeName, "Gayatri Divine"),
      tagline: str(store.tagline, ""),
      storeEmail: str(store.storeEmail, ""),
      storePhone: str(store.storePhone, ""),
      storeAddress: str(store.storeAddress, ""),
      logoPath: str(store.logoPath, "/logo.png"),
      currency: str(store.currency, "INR"),
    },
    shipping: {
      freeShippingThreshold: Math.max(0, num(shipping.freeShippingThreshold, 1500)),
      standardShippingRate: Math.max(0, num(shipping.standardShippingRate, 99)),
      expressShippingRate: Math.max(0, num(shipping.expressShippingRate, 199)),
      estimatedDelivery: str(shipping.estimatedDelivery, "5-7 business days"),
    },
    payment: {
      razorpayEnabled: bool(payment.razorpayEnabled, true),
      codEnabled: bool(payment.codEnabled, true),
      codLimit: Math.max(0, num(payment.codLimit, 10000)),
      // Note: this is public key id only; secret should remain server env.
      razorpayKeyId: str(payment.razorpayKeyId, ""),
    },
    gst: {
      enabled: bool(gst.enabled, false),
      gstin: str(gst.gstin, ""),
      ratePercent: Math.max(0, Math.min(100, num(gst.ratePercent, 18))),
      pricesAreInclusive: bool(gst.pricesAreInclusive, true),
    },
    otp: {
      enabled: bool(otp.enabled, true),
      provider: str(otp.provider, "msg91"),
      requireOnCheckout: bool(otp.requireOnCheckout, true),
    },
    admin: {
      adminEmails: arrayOfStrings(admin.adminEmails),
      supportEmail: str(admin.supportEmail, ""),
    },
  };
}
