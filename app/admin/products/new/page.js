"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { createProduct } from "@/lib/products";
import { listCategories } from "@/lib/categories";
import { storage, BUCKETS, ID } from "@/lib/appwrite";
import { slugify } from "@/lib/slug";

export default function NewProductPage() {
  const router = useRouter();
  const { isAdmin, isLoading, admin } = useAdmin();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState("");
  const mainImageUrlRef = useRef("");
  const [categories, setCategories] = useState([]);
  const [slugTouched, setSlugTouched] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    category: "product",
    price: "",
    originalPrice: "",
    image: "",
    images: [""],
    colors: [""],
    features: [""],
    inStock: true,
    rating: 4.5,
    reviews: 0
  });

  const uploadImageToMainBucket = async (file) => {
    if (!file) return "";
    const uploaded = await storage.createFile({
      bucketId: BUCKETS.MAIN,
      fileId: ID.unique(),
      file,
    });
    const fileId = uploaded?.$id;
    if (!fileId) throw new Error("Upload failed: missing file id");

    const view = storage.getFileView({ bucketId: BUCKETS.MAIN, fileId });
    return view?.href ? view.href : String(view);
  };

  useEffect(() => {
    return () => {
      if (mainImagePreview && mainImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(mainImagePreview);
      }
    };
  }, [mainImagePreview]);

  const setMainImageUrl = (url) => {
    const clean = String(url || "").trim();
    setFormData((prev) => {
      const existing = Array.isArray(prev.images) ? prev.images.filter(Boolean) : [];
      const merged = clean
        ? [clean, ...existing.filter((x) => x !== clean)]
        : existing;
      return {
        ...prev,
        image: clean,
        images: merged.length > 0 ? merged : [""]
      };
    });
  };

  const addAdditionalImageUrls = (urls) => {
    const cleaned = (urls || []).map((u) => String(u || "").trim()).filter(Boolean);
    if (cleaned.length === 0) return;
    setFormData((prev) => {
      const existing = Array.isArray(prev.images) ? prev.images.filter(Boolean) : [];
      const merged = [...existing, ...cleaned].filter((v, i, a) => a.indexOf(v) === i);
      return { ...prev, images: merged.length > 0 ? merged : [""] };
    });
  };

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/admin/login");
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const cats = await listCategories({ onlyActive: true });
        if (!cancelled) setCategories(cats);
      } catch {
        if (!cancelled) setCategories([]);
      }
    };

    if (!isLoading && isAdmin) load();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, isLoading]);

  useEffect(() => {
    if (slugTouched) return;
    const nextSlug = slugify(formData.name);
    setFormData((prev) => ({
      ...prev,
      slug: nextSlug,
    }));
  }, [formData.name, slugTouched]);

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "slug") setSlugTouched(true);
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item))
    }));
  };

  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      if (uploading) {
        throw new Error("Please wait for the image upload to finish.");
      }
      const cleanedImages = Array.isArray(formData.images)
        ? formData.images.map((x) => String(x || "").trim()).filter(Boolean)
        : [];
      const mainCandidate = String(
        formData.image || mainImageUrlRef.current || cleanedImages[0] || ""
      ).trim();
      const mergedImages = mainCandidate
        ? [mainCandidate, ...cleanedImages.filter((x) => x !== mainCandidate)]
        : cleanedImages;

      if (!mainCandidate && mergedImages.length === 0) {
        throw new Error("Please upload a main image (bucket: main)");
      }

      const submission = {
        ...formData,
        slug: slugify(formData.slug || formData.name),
        image: mainCandidate,
        images: mergedImages.length > 0 ? mergedImages : [""]
      };

      setSaving(true);
      await createProduct(submission, { ownerUserId: admin?.$id });
      alert("Product created successfully!");
      router.push("/admin/products");
    } catch (err) {
      console.error("Create product failed:", err);
      setError(err?.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      
      <main className="flex-1 ml-64">
        <AdminHeader title="Add New Product" />
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="max-w-4xl">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              {error && (
                <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
                  {error}
                </div>
              )}
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug (URL / ID) *
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={(e) => {
                        const next = slugify(e.target.value);
                        setSlugTouched(true);
                        setFormData((prev) => ({ ...prev, slug: next }));
                      }}
                      required
                      spellCheck={false}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Auto-generated from product name. You can edit it before saving.
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      list="categoryOptions"
                      placeholder="e.g. purse, wallet"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <datalist id="categoryOptions">
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug || c.id}>
                          {c.name}
                        </option>
                      ))}
                    </datalist>
                    <p className="mt-1 text-xs text-gray-500">
                      Use a category slug (recommended). You can type a new one.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleChange}
                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">In Stock</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Original Price (₹)
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Main Image *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const previewUrl = URL.createObjectURL(file);
                        setMainImagePreview((prev) => {
                          if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
                          return previewUrl;
                        });
                        try {
                          setUploading(true);
                          setError("");
                          const url = await uploadImageToMainBucket(file);
                          mainImageUrlRef.current = String(url || "");
                          setMainImageUrl(url);
                          setMainImagePreview(String(url || ""));
                        } catch (err) {
                          console.error("Main image upload failed:", err);
                          setError(err?.message || "Failed to upload image");
                        } finally {
                          setUploading(false);
                          e.target.value = "";
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    {(mainImagePreview || formData.image) && (
                      <img
                        src={mainImagePreview || formData.image}
                        alt="Preview"
                        className="mt-2 w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    {uploading && (
                      <p className="mt-2 text-sm text-gray-500">Uploading to bucket: main…</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Images
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploading}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;
                        try {
                          setUploading(true);
                          setError("");
                          const urls = [];
                          for (const f of files) {
                            // Sequential upload keeps it simple and avoids rate spikes
                            const u = await uploadImageToMainBucket(f);
                            urls.push(u);
                          }
                          addAdditionalImageUrls(urls);
                        } catch (err) {
                          console.error("Additional image upload failed:", err);
                          setError(err?.message || "Failed to upload images");
                        } finally {
                          setUploading(false);
                          e.target.value = "";
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Images are uploaded to Appwrite bucket <span className="font-medium">main</span>.
                    </p>
                    {formData.images.map((img, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="url"
                          value={img}
                          onChange={(e) => handleArrayChange("images", index, e.target.value)}
                          placeholder="https://..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        {formData.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem("images", index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem("images")}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      + Add Image
                    </button>
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Colors</h3>
                {formData.colors.map((color, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => handleArrayChange("colors", index, e.target.value)}
                      placeholder="e.g., Black, Brown, Red"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    {formData.colors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("colors", index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("colors")}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  + Add Color
                </button>
              </div>

              {/* Features */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleArrayChange("features", index, e.target.value)}
                      placeholder="e.g., Genuine leather, Multiple compartments"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("features", index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("features")}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  + Add Feature
                </button>
              </div>

              {/* Actions */}
              <div className="border-t pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
                >
                  {uploading ? "Uploading..." : saving ? "Saving..." : "Create Product"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

