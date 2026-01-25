import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from "@/lib/appwrite";
import { slugify, withSlugSuffix } from "@/lib/slug";

function parseMaybeJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // Allow comma-separated fallback
      if (trimmed.includes(",")) {
        return trimmed
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    }
  }
  return [];
}

function toNumber(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function toBoolean(value, fallback = true) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return fallback;
}

export function mapProductDoc(doc) {
  const images = parseMaybeJsonArray(doc.images);
  const colors = parseMaybeJsonArray(doc.colors);
  const features = parseMaybeJsonArray(doc.features);

  const mainImage = doc.image || images[0] || "";
  const normalizedImages = images.length > 0 ? images : mainImage ? [mainImage] : [];

  const isActive = typeof doc.isActive === "boolean" ? doc.isActive : true;
  const stockQuantity =
    typeof doc.stockQuantity === "number" && Number.isFinite(doc.stockQuantity)
      ? doc.stockQuantity
      : null;

  const inStock =
    typeof doc.inStock === "boolean"
      ? doc.inStock
      : isActive && (stockQuantity == null ? true : stockQuantity > 0);

  return {
    id: doc.$id,
    slug: doc.slug || "",
    name: doc.productName || doc.name || "",
    description: doc.description || "",
    category: doc.category || "",
    price: toNumber(doc.price, 0),
    originalPrice: toNumber(doc.originalPrice, toNumber(doc.price, 0)),
    image: mainImage,
    images: normalizedImages,
    colors,
    features,
    inStock,
    rating: toNumber(doc.rating, 0),
    reviews: toNumber(doc.reviews, 0),
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

function normalizeStringArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    // Allow JSON or plain single value
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v).trim()).filter(Boolean);
      }
    } catch {
      // ignore
    }
    return [trimmed];
  }
  return [];
}

export function toProductDocumentData(formData, { mode = "update" } = {}) {
  const name = (formData.name || formData.productName || "").trim();
  const slugInput = (formData.slug || "").trim();
  const description = (formData.description || "").trim();
  const category = (formData.category || "product").trim() || "product";
  const image = (formData.image || "").trim();

  const images = normalizeStringArray(formData.images).filter(Boolean);
  const colors = normalizeStringArray(formData.colors).filter(Boolean);
  const features = normalizeStringArray(formData.features).filter(Boolean);

  const mergedImages = [...images];
  if (image && !mergedImages.includes(image)) mergedImages.unshift(image);

  const price = toNumber(formData.price, 0);
  const originalPrice = toNumber(formData.originalPrice, price);

  const now = new Date().toISOString();
  const isActive =
    typeof formData.isActive === "boolean"
      ? formData.isActive
      : typeof formData.inStock === "boolean"
        ? formData.inStock
        : true;

  const stockQuantityRaw = formData.stockQuantity;
  const stockQuantity =
    stockQuantityRaw === "" || stockQuantityRaw == null
      ? null
      : Math.max(0, Math.trunc(toNumber(stockQuantityRaw, 0)));

  const data = {
    // Appwrite schema fields
    slug: slugInput ? slugify(slugInput) : slugify(name),
    productName: name,
    description,
    category,
    price,
    originalPrice,
    image,
    images: mergedImages,
    colors,
    features,
    isActive,
    stockQuantity,
    rating: toNumber(formData.rating, 0),
    reviews: Math.max(0, Math.trunc(toNumber(formData.reviews, 0))),
  };

  if (data.stockQuantity == null) {
    delete data.stockQuantity;
  }

  if (mode === "create") {
    data.createdAt = now;
    data.updatedAt = now;
  } else {
    data.updatedAt = now;
  }

  return data;
}

export async function listProducts({ limit = 100, offset = 0, category = null } = {}) {
  const queries = [Query.orderDesc("$createdAt"), Query.limit(limit), Query.offset(offset)];
  if (category && category !== "all") {
    queries.push(Query.equal("category", category));
  }

  const response = await databases.listDocuments({
    databaseId: DATABASE_ID,
    collectionId: COLLECTIONS.PRODUCTS,
    queries,
  });

  return {
    total: response.total ?? response.documents?.length ?? 0,
    products: (response.documents || []).map(mapProductDoc),
    raw: response,
  };
}

export async function listAllProducts({ pageSize = 100 } = {}) {
  const all = [];
  let offset = 0;

  while (true) {
    const { products } = await listProducts({ limit: pageSize, offset });
    all.push(...products);
    if (products.length < pageSize) break;
    offset += products.length;
    if (offset > 5000) break;
  }

  return all;
}

export async function getProduct(productId) {
  try {
    const doc = await databases.getDocument({
      databaseId: DATABASE_ID,
      collectionId: COLLECTIONS.PRODUCTS,
      documentId: productId,
    });

    return mapProductDoc(doc);
  } catch (err) {
    // Back-compat: if the route uses a slug but older docs have random $id,
    // try resolving by the stored `slug` attribute.
    const status = err?.code || err?.response?.code || err?.response?.status;
    if (status !== 404) throw err;

    try {
      const response = await databases.listDocuments({
        databaseId: DATABASE_ID,
        collectionId: COLLECTIONS.PRODUCTS,
        queries: [Query.equal("slug", String(productId || "")), Query.limit(1)],
      });
      const doc = response?.documents?.[0];
      if (!doc) throw err;
      return mapProductDoc(doc);
    } catch {
      throw err;
    }
  }
}

function isIdConflictError(err) {
  const code = err?.code || err?.response?.code || err?.response?.status;
  if (code === 409) return true;
  const msg = String(err?.message || "").toLowerCase();
  return msg.includes("already exists") || msg.includes("conflict");
}

export async function createProduct(formData, { ownerUserId } = {}) {
  const data = toProductDocumentData(formData, { mode: "create" });

  let baseSlug = slugify(data.slug || formData?.slug || formData?.name || formData?.productName);
  if (!baseSlug) {
    baseSlug = `product-${Date.now()}`;
    baseSlug = slugify(baseSlug) || `product-${Date.now()}`;
  }

  const permissions = ["read(\"any\")"];
  if (ownerUserId) {
    permissions.push(`update(\"user:${ownerUserId}\")`, `delete(\"user:${ownerUserId}\")`);
  }

  // Use the slug as the document ID. If it already exists, append -2, -3, etc.
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const candidate = attempt === 0 ? baseSlug : withSlugSuffix(baseSlug, String(attempt + 1));
    try {
      const doc = await databases.createDocument({
        databaseId: DATABASE_ID,
        collectionId: COLLECTIONS.PRODUCTS,
        documentId: candidate,
        data: { ...data, slug: candidate },
        permissions,
      });
      return mapProductDoc(doc);
    } catch (err) {
      if (!isIdConflictError(err) || attempt >= 24) throw err;
    }
  }

  // Fallback (should never hit)
  const doc = await databases.createDocument({
    databaseId: DATABASE_ID,
    collectionId: COLLECTIONS.PRODUCTS,
    documentId: ID.unique(),
    data,
    permissions,
  });
  return mapProductDoc(doc);
}

export async function updateProduct(productId, formData) {
  const data = toProductDocumentData(formData, { mode: "update" });

  const doc = await databases.updateDocument({
    databaseId: DATABASE_ID,
    collectionId: COLLECTIONS.PRODUCTS,
    documentId: productId,
    data,
  });

  return mapProductDoc(doc);
}

export async function deleteProduct(productId) {
  await databases.deleteDocument({
    databaseId: DATABASE_ID,
    collectionId: COLLECTIONS.PRODUCTS,
    documentId: productId,
  });

  return true;
}
