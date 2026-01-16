"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/lib/categories";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { isAdmin, isLoading, admin } = useAdmin();

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({ name: "", slug: "", isActive: true });
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      setLoadingCats(true);
      setError("");
      const items = await listCategories({ onlyActive: false });
      setCategories(items);
    } catch (e) {
      console.error("Failed to load categories:", e);
      setError(
        e?.message ||
          "Failed to load categories. Ensure the Appwrite 'categories' collection exists."
      );
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/admin/login");
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isAdmin) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, isLoading]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) =>
      `${c.name} ${c.slug}`.toLowerCase().includes(q)
    );
  }, [categories, search]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name || "", slug: c.slug || "", isActive: !!c.isActive });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", slug: "", isActive: true });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      setError("");
      if (editingId) {
        const updated = await updateCategory(editingId, form);
        setCategories((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
        resetForm();
      } else {
        const created = await createCategory(form, { ownerUserId: admin?.$id });
        setCategories((prev) => [created, ...prev]);
        resetForm();
      }
    } catch (e2) {
      console.error("Save category failed:", e2);
      setError(e2?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (c) => {
    const ok = confirm(`Delete category "${c.name}"?`);
    if (!ok) return;

    try {
      await deleteCategory(c.id);
      setCategories((prev) => prev.filter((x) => x.id !== c.id));
      if (editingId === c.id) resetForm();
    } catch (e) {
      console.error("Delete category failed:", e);
      alert(e?.message || "Failed to delete category");
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />

      <main className="flex-1 ml-64">
        <AdminHeader title="Categories" />

        <div className="p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-md">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                New Category
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
              {loadingCats ? (
                <div className="p-6 text-gray-600">Loading categories...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Slug
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filtered.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{c.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">{c.slug}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-sm font-medium ${
                                c.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {c.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(c)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Edit"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => onDelete(c)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filtered.length === 0 && (
                    <div className="p-6 text-center text-gray-500">No categories found</div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingId ? "Edit Category" : "Add Category"}
              </h3>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="auto-generated if empty"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Use this value in products (recommended).
                  </p>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, isActive: e.target.checked }))
                    }
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>

                <div className="flex gap-3 pt-2">
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={saving}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400"
                  >
                    {saving ? "Saving..." : editingId ? "Update" : "Create"}
                  </button>
                </div>
              </form>

              <p className="mt-6 text-xs text-gray-500">
                Note: Deleting a category does not automatically update existing products.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
