import fs from "fs/promises";
import path from "path";

const SETTINGS_RELATIVE_PATH = path.join("data", "settings.json");

// Default settings fallback
const DEFAULT_SETTINGS = {
  store: {
    storeName: "Gayatri Divine",
    tagline: "Premium Products",
    storeEmail: "support@gayatridivine.com",
    storePhone: "9876543210",
    storeAddress: "Delhi, 110044",
    logoPath: "/logo.png",
    currency: "INR"
  },
  shipping: {
    freeShippingThreshold: 1500,
    standardShippingRate: 99,
    expressShippingRate: 199,
    estimatedDelivery: "5-7 business days"
  },
  payment: {
    razorpayEnabled: true,
    codEnabled: true,
    codLimit: 10000,
    razorpayKeyId: ""
  },
  gst: {
    enabled: false,
    gstin: "",
    ratePercent: 18,
    pricesAreInclusive: true
  },
  otp: {
    enabled: true,
    provider: "msg91",
    requireOnCheckout: true
  },
  admin: {
    adminEmails: [
      "admin@gayatridivine.com",
      "owner@gayatridivine.com",
      "ambujpandey742@gmail.com"
    ],
    supportEmail: "support@gayatridivine.com"
  }
};

export function getSettingsFilePath() {
  return path.join(process.cwd(), SETTINGS_RELATIVE_PATH);
}

export async function readSettingsFile() {
  try {
    const filePath = getSettingsFilePath();
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    // If file doesn't exist (e.g., on server), return default settings
    if (error.code === 'ENOENT') {
      console.warn('Settings file not found, using default settings');
      return DEFAULT_SETTINGS;
    }
    throw error;
  }
}

export async function writeSettingsFile(nextSettings) {
  try {
    const filePath = getSettingsFilePath();
    const json = JSON.stringify(nextSettings, null, 2) + "\n";
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(filePath, json, "utf8");
    return true;
  } catch (error) {
    console.error('Failed to write settings file:', error.message);
    // On server environments where file system may be read-only,
    // log the error but don't crash - settings updates should use database instead
    throw error;
  }
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
