import ProductClient from "./ProductClient";
import { getProduct } from "@/lib/products";

function getBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (envUrl) {
    const withProto = /^https?:\/\//i.test(envUrl) ? envUrl : `https://${envUrl}`;
    return withProto.replace(/\/+$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, "");
  }
  return "http://localhost:3000";
}

function toAbsoluteUrl(url, baseUrl) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
}

function toPlainTextDescription(value, maxLen = 160) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1)}…`;
}

export async function generateMetadata({ params }) {
  const baseUrl = getBaseUrl();
  const unwrappedParams = await params;
  const productId = unwrappedParams?.id;
  const fallbackUrl = `${baseUrl}/product/${encodeURIComponent(productId || "")}`;

  try {
    const product = await getProduct(productId);
    const canonicalId = product?.slug || product?.id || productId;
    const url = `${baseUrl}/product/${encodeURIComponent(canonicalId || "")}`;
    const title = product?.name ? `${product.name} | Gayatri Divine` : "Product | Gayatri Divine";
    const description =
      toPlainTextDescription(product?.description) ||
      (product?.name ? `Buy ${product.name} online.` : "Browse products.");

    const primaryImage =
      (Array.isArray(product?.images) && product.images.length > 0 ? product.images[0] : null) ||
      product?.image ||
      null;
    const absoluteImage = toAbsoluteUrl(primaryImage, baseUrl);

    return {
      metadataBase: new URL(baseUrl),
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        type: "website",
        images: absoluteImage ? [{ url: absoluteImage, alt: product?.name || "Product" }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: absoluteImage ? [absoluteImage] : [],
      },
    };
  } catch {
    return {
      metadataBase: new URL(baseUrl),
      title: "Product | Gayatri Divine",
      description: "Browse products.",
      alternates: { canonical: fallbackUrl },
      openGraph: { url: fallbackUrl, type: "website" },
      twitter: { card: "summary" },
    };
  }
}

export default async function ProductPage({ params }) {
  const unwrappedParams = await params;
  const productId = unwrappedParams?.id;
  const initialProduct = productId ? await getProduct(productId).catch(() => null) : null;
  return <ProductClient productId={productId} initialProduct={initialProduct} />;
}
