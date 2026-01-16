import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from "@/lib/appwrite";

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function mapCategoryDoc(doc) {
  return {
    id: doc.$id,
    name: doc.name || "",
    slug: doc.slug || slugify(doc.name || ""),
    isActive: typeof doc.isActive === "boolean" ? doc.isActive : true,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

export function toCategoryDocumentData(formData, { mode = "update" } = {}) {
  const name = String(formData?.name || "").trim();
  const slug = String(formData?.slug || slugify(name)).trim() || slugify(name);
  const isActive =
    typeof formData?.isActive === "boolean" ? formData.isActive : true;

  const now = new Date().toISOString();

  const data = {
    name,
    slug,
    isActive,
  };

  if (mode === "create") {
    data.createdAt = now;
    data.updatedAt = now;
  } else {
    data.updatedAt = now;
  }

  return data;
}

export async function listCategories({ onlyActive = true } = {}) {
  const queries = [Query.orderAsc("name"), Query.limit(200)];
  if (onlyActive) queries.push(Query.equal("isActive", true));

  const response = await databases.listDocuments({
    databaseId: DATABASE_ID,
    collectionId: COLLECTIONS.CATEGORIES,
    queries,
  });

  return (response.documents || []).map(mapCategoryDoc);
}

export async function createCategory(formData, { ownerUserId } = {}) {
  const data = toCategoryDocumentData(formData, { mode: "create" });

  const permissions = ["read(\"any\")"];
  if (ownerUserId) {
    permissions.push(`update(\"user:${ownerUserId}\")`, `delete(\"user:${ownerUserId}\")`);
  }

  const doc = await databases.createDocument({
    databaseId: DATABASE_ID,
    collectionId: COLLECTIONS.CATEGORIES,
    documentId: ID.unique(),
    data,
    permissions,
  });

  return mapCategoryDoc(doc);
}

export async function updateCategory(categoryId, formData) {
  const data = toCategoryDocumentData(formData, { mode: "update" });

  const doc = await databases.updateDocument({
    databaseId: DATABASE_ID,
    collectionId: COLLECTIONS.CATEGORIES,
    documentId: categoryId,
    data,
  });

  return mapCategoryDoc(doc);
}

export async function deleteCategory(categoryId) {
  await databases.deleteDocument({
    databaseId: DATABASE_ID,
    collectionId: COLLECTIONS.CATEGORIES,
    documentId: categoryId,
  });

  return true;
}

export function deriveCategoriesFromProducts(products) {
  const map = new Map();
  for (const p of products || []) {
    const id = String(p?.category || "").trim();
    if (!id) continue;
    if (!map.has(id)) {
      map.set(id, {
        id,
        name: id,
        slug: slugify(id),
        isActive: true,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}
