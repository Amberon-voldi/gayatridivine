import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from "@/lib/appwrite";

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

  return {
    id: doc.$id,
    name: doc.name || "",
    description: doc.description || "",
    category: doc.category || "",
    price: toNumber(doc.price, 0),
    originalPrice: toNumber(doc.originalPrice, toNumber(doc.price, 0)),
    image: mainImage,
    images: normalizedImages,
    colors,
    features,
    inStock: toBoolean(doc.inStock, true),
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

export function toProductDocumentData(formData) {
  const name = (formData.name || "").trim();
  const description = (formData.description || "").trim();
  const category = (formData.category || "").trim();
  const image = (formData.image || "").trim();

  const images = normalizeStringArray(formData.images).filter(Boolean);
  const colors = normalizeStringArray(formData.colors).filter(Boolean);
  const features = normalizeStringArray(formData.features).filter(Boolean);

  const mergedImages = [...images];
  if (image && !mergedImages.includes(image)) mergedImages.unshift(image);

  const price = toNumber(formData.price, 0);
  const originalPrice = toNumber(formData.originalPrice, price);

  return {
    name,
    description,
    category,
    price,
    originalPrice,
    image,
    // Store arrays as JSON strings to be compatible with string attributes.
    images: JSON.stringify(mergedImages),
    colors: JSON.stringify(colors),
    features: JSON.stringify(features),
    inStock: !!formData.inStock,
    rating: toNumber(formData.rating, 0),
    reviews: Math.max(0, Math.trunc(toNumber(formData.reviews, 0))),
  };
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
  const doc = await databases.getDocument({
    databaseId: DATABASE_ID,
    collectionId: COLLECTIONS.PRODUCTS,
    documentId: productId,
  });

  return mapProductDoc(doc);
}

export async function createProduct(formData, { ownerUserId } = {}) {
  const data = toProductDocumentData(formData);

  const permissions = ["read(\"any\")"];
  if (ownerUserId) {
    permissions.push(`update(\"user:${ownerUserId}\")`, `delete(\"user:${ownerUserId}\")`);
  }

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
  const data = toProductDocumentData(formData);

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
