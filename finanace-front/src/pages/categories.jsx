import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit2, Trash2, X, RefreshCcw, ChevronDown, ChevronRight, Search } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/api";

/**
 * Categories.jsx — Full CRUD for Category model (DRF ViewSet)
 * - Lists categories (optionally filtered by parent)
 * - Create / Edit with modal
 * - Soft delete via DELETE endpoint
 * - Parent selector (prevent self-parenting)
 * - Search client-side by name
 * - Defensive handling of paginated or non-paginated responses
 */

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [parents, setParents] = useState([]); // options for parent selector
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [filterParent, setFilterParent] = useState(""); // UUID or ""
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // category object or null
  const [form, setForm] = useState({ name: "", parent: "" });

  // Helpers
  const normalizeList = (resp) => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (resp.results && Array.isArray(resp.results)) return resp.results;
    return [];
  };

  const fetchParents = async () => {
    try {
      // We fetch all categories without filter for parent picker
      const { data } = await api.get("/categories/");
      setParents(normalizeList(data));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load parent options");
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterParent) params.parent = filterParent;
      const { data } = await api.get("/categories/", { params });
      const list = normalizeList(data);
      setCategories(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // Also preload parents list for creation/editing
    fetchParents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParent]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", parent: filterParent || "" });
    setIsModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat?.name || "", parent: cat?.parent || "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setForm({ name: "", parent: "" });
  };

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (editing && editing.id === form.parent) {
      toast.error("A category cannot be its own parent");
      return false;
    }
    return true;
  };

  const saveCategory = async (e) => {
    e?.preventDefault?.();
    if (!validateForm()) return;
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      parent: form.parent || null,
    };

    try {
      if (editing) {
        await api.patch(`/categories/${editing.id}/`, payload);
        toast.success("Category updated");
      } else {
        await api.post("/categories/", payload);
        toast.success("Category created");
      }
      closeModal();
      fetchCategories();
      fetchParents();
    } catch (err) {
      console.error(err);
      const detail = err?.response?.data;
      if (detail?.non_field_errors) {
        toast.error(detail.non_field_errors.join(" "));
      } else if (detail?.name) {
        toast.error(Array.isArray(detail.name) ? detail.name.join(" ") : String(detail.name));
      } else {
        toast.error("Save failed");
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!id) return;
    setDeletingId(id);
    try {
      await api.delete(`/categories/${id}/`);
      toast.success("Category deleted");
      fetchCategories();
      fetchParents();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((c) => (c.name || "").toLowerCase().includes(term));
  }, [categories, searchTerm]);

  const findParentName = (id) => {
    if (!id) return "—";
    const p = parents.find((x) => x.id === id);
    return p ? p.name : "—";
  };

  const RootBadge = () => (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-gray-700">Root</span>
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <Toaster />
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-gray-500">Create, edit, and organize your categories. Use parent to nest.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchCategories}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-3 py-2 text-sm text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New Category
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name..."
            className="w-full rounded-xl border px-8 py-2 text-sm focus:outline-none focus:ring"
          />
        </div>
        <div className="sm:col-span-2 grid grid-cols-2 gap-3">
          <select
            value={filterParent}
            onChange={(e) => setFilterParent(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          >
            <option value="">All (no filter)</option>
            {/* Root option to quickly view only root categories */}
            <option value="__ROOT__" disabled>────────────</option>
            {parents
              .filter((p) => !p.parent) // root parents list
              .map((p) => (
                <option key={p.id} value={p.id}>
                  Parent filter: {p.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Parent</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={4}>
                  Loading categories...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={4}>
                  No categories found.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-sm">
                    {c.parent ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                        <ChevronRight className="h-3 w-3" />
                        {findParentName(c.parent)}
                      </span>
                    ) : (
                      <RootBadge />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {c.created_at ? new Date(c.created_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="inline-flex items-center gap-1 rounded-xl border px-2 py-1 text-xs hover:bg-gray-50"
                      >
                        <Edit2 className="h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => deleteCategory(c.id)}
                        className="inline-flex items-center gap-1 rounded-xl border px-2 py-1 text-xs hover:bg-red-50"
                        disabled={deletingId === c.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === c.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editing ? "Edit Category" : "New Category"}
              </h2>
              <button onClick={closeModal} className="rounded-full p-1 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={saveCategory} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={onFormChange}
                  placeholder="e.g., Food, Transport, Utilities"
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Parent (optional)</label>
                <select
                  name="parent"
                  value={form.parent || ""}
                  onChange={onFormChange}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                >
                  <option value="">None (root)</option>
                  {parents
                    .filter((p) => !editing || p.id !== editing.id) // prevent self as parent
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
                {editing && editing.parent && editing.parent === editing.id && (
                  <p className="mt-1 text-xs text-red-600">Invalid parent: cannot be itself.</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={closeModal} className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-3 py-2 text-sm text-white hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <ChevronDown className="h-4 w-4 animate-bounce" /> Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
