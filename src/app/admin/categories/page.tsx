"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Tag, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      const cats = (data.categories || []).map((c: Category & { _count?: { products: number } }) => ({
        ...c,
        productCount: c._count?.products ?? c.productCount ?? 0,
      }));
      setCategories(cats);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  // Auto-generate slug when creating new
  useEffect(() => {
    if (!editingCategory && formName) {
      setFormSlug(
        formName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      );
    }
  }, [formName, editingCategory]);

  const openCreate = () => {
    setEditingCategory(null);
    setFormName(""); setFormSlug(""); setFormDescription(""); setModalError("");
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name); setFormSlug(cat.slug); setFormDescription(cat.description || ""); setModalError("");
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingCategory(null); setModalError(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setSubmitting(true);
    try {
      const body = { name: formName, slug: formSlug, description: formDescription };
      let res: Response;
      if (editingCategory) {
        res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/admin/categories", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
      }
      const data = await res.json();
      if (!res.ok) { setModalError(data.error || "Failed to save category"); return; }
      closeModal();
      fetchCategories();
    } catch { setModalError("Network error. Please try again."); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string, name: string, productCount: number) => {
    if (productCount > 0) {
      setError(`Cannot delete "${name}" — it has ${productCount} product(s) assigned. Reassign them first.`);
      setTimeout(() => setError(""), 5000);
      return;
    }
    if (!window.confirm(`Delete category "${name}"?`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete");
        setTimeout(() => setError(""), 5000);
      } else {
        fetchCategories();
      }
    } catch { setError("Network error."); }
    finally { setDeleting(null); }
  };

  const inputCls = "w-full border border-[#D4C5B0] focus:border-[#C6A15B] rounded-lg px-3 py-2.5 text-sm text-[#1C241D] outline-none bg-white transition-colors";

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <p className="text-[#5E7052] text-sm">{categories.length} categories total</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C6A15B] text-[#1C241D] rounded-lg text-sm font-semibold hover:bg-[#826530] hover:text-white transition-colors"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-2 border-[#C6A15B] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-[#E8E0D5] text-[#5E7052]">
          <Tag className="mx-auto mb-3 text-[#D4C5B0]" size={40} />
          <p>No categories yet.</p>
          <button onClick={openCreate} className="mt-3 text-[#C6A15B] text-sm hover:underline flex items-center gap-1 mx-auto">
            <Plus size={14} /> Add first category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl border border-[#E8E0D5] p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#F8F1E7] rounded-lg">
                    <Tag className="text-[#C6A15B]" size={16} />
                  </div>
                  <h3 className="text-[#1C241D] font-semibold text-sm">{cat.name}</h3>
                </div>
                <span className="text-xs bg-[#F8F1E7] text-[#826530] px-2 py-0.5 rounded-full font-medium border border-[#E8E0D5]">
                  {cat.productCount} {cat.productCount === 1 ? "product" : "products"}
                </span>
              </div>
              <p className="text-[#5E7052] text-xs font-mono mb-2">/{cat.slug}</p>
              {cat.description && (
                <p className="text-[#43513B] text-xs leading-relaxed line-clamp-2">{cat.description}</p>
              )}
              <div className="flex gap-2 mt-4 pt-3 border-t border-[#F0E8DC]">
                <button
                  onClick={() => openEdit(cat)}
                  className="flex items-center gap-1.5 text-xs text-[#5E7052] hover:text-[#C6A15B] px-2.5 py-1.5 border border-[#E8E0D5] hover:border-[#C6A15B] rounded-lg transition-colors"
                >
                  <Edit size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name, cat.productCount)}
                  disabled={deleting === cat.id}
                  className="flex items-center gap-1.5 text-xs text-[#A8B89A] hover:text-red-500 px-2.5 py-1.5 border border-[#E8E0D5] hover:border-red-300 rounded-lg transition-colors disabled:opacity-40"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E0D5]">
              <h2 className="text-[#1C241D] font-semibold">{editingCategory ? "Edit Category" : "Add Category"}</h2>
              <button onClick={closeModal} className="text-[#5E7052] hover:text-[#1C241D] transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{modalError}</div>
              )}
              <div>
                <label className="block text-[#5E7052] text-xs font-medium mb-1.5 uppercase tracking-wide">Name *</label>
                <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className={inputCls} placeholder="e.g. Bridal Sarees" />
              </div>
              <div>
                <label className="block text-[#5E7052] text-xs font-medium mb-1.5 uppercase tracking-wide">Slug *</label>
                <input type="text" required value={formSlug} onChange={(e) => setFormSlug(e.target.value)} className={inputCls} placeholder="bridal-sarees" />
                <p className="text-[#A8B89A] text-xs mt-1">Used in URLs. Auto-generated from name.</p>
              </div>
              <div>
                <label className="block text-[#5E7052] text-xs font-medium mb-1.5 uppercase tracking-wide">Description</label>
                <textarea rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className={inputCls + " resize-none"} placeholder="Brief description of this category…" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 border border-[#D4C5B0] text-[#5E7052] rounded-lg text-sm hover:bg-[#F8F1E7] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-[#C6A15B] text-[#1C241D] font-semibold rounded-lg text-sm hover:bg-[#826530] hover:text-white transition-colors disabled:opacity-50">
                  {submitting ? "Saving…" : editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
