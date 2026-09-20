"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

interface Category {
  id: string;
  name: string;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  categoryId: string;
  fabric: string;
  color: string;
  isActive: boolean;
  isFeatured: boolean;
  images: string[];
}

const defaultForm: FormData = {
  name: "",
  description: "",
  price: "",
  compareAtPrice: "",
  stock: "10",
  categoryId: "",
  fabric: "",
  color: "",
  isActive: true,
  isFeatured: false,
  images: [],
};

export default function AdminNewProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(defaultForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => {
        const list = d.categories || [];
        setCategories(list);
        if (list.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: list[0].id }));
        }
      })
      .catch(console.error);
  }, []);

  const set = (field: keyof FormData, value: unknown) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Please enter a product name.");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Please enter a valid price.");
      return;
    }
    if (!formData.categoryId) {
      setError("Please select a category.");
      return;
    }

    setSubmitting(true);
    try {
      const validImages = formData.images.filter(Boolean);
      const body = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        stock: parseInt(formData.stock) || 0,
        categoryId: formData.categoryId,
        fabric: formData.fabric.trim() || undefined,
        color: formData.color.trim() || undefined,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        imageUrls: validImages,
        images: validImages,
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create product");
        return;
      }
      router.push("/admin/products");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full border border-[#D4C5B0] focus:border-[#C6A15B] focus:ring-1 focus:ring-[#C6A15B] rounded-lg px-3.5 py-2.5 text-sm text-[#1C241D] outline-none bg-white transition-all";
  const labelCls = "block text-[#5E7052] text-xs font-semibold mb-1.5 uppercase tracking-wider";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="p-2 text-[#5E7052] hover:text-[#C6A15B] border border-[#D4C5B0] hover:border-[#C6A15B] rounded-lg transition-colors bg-white shadow-xs"
        >
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h2 className="text-[#1C241D] font-serif font-bold text-xl">Add New Saree</h2>
          <p className="text-xs text-[#5E7052]">Create and publish a new saree to your boutique catalog</p>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-fadeIn">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Main Information + Photo Upload) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6 shadow-xs space-y-5">
              <h3 className="text-[#1C241D] font-semibold text-sm border-b border-[#F0E8DC] pb-3">
                Basic Information
              </h3>

              <div>
                <label className={labelCls}>Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={inputCls}
                  placeholder="e.g., Pure Kanjivaram Bridal Silk Saree in Crimson Red"
                />
              </div>

              <div>
                <label className={labelCls}>Category *</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => set("categoryId", e.target.value)}
                  className={inputCls}
                >
                  <option value="">— Select Collection / Category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => set("description", e.target.value)}
                  className={inputCls + " resize-none"}
                  placeholder="Describe the weave, drape richness, craftsmanship, and styling notes…"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className={labelCls}>Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1}
                    value={formData.price}
                    onChange={(e) => set("price", e.target.value)}
                    className={inputCls}
                    placeholder="15000"
                  />
                </div>
                <div>
                  <label className={labelCls}>Compare Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={formData.compareAtPrice}
                    onChange={(e) => set("compareAtPrice", e.target.value)}
                    className={inputCls}
                    placeholder="18500"
                  />
                </div>
                <div>
                  <label className={labelCls}>Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) => set("stock", e.target.value)}
                    className={inputCls}
                    placeholder="10"
                  />
                </div>
              </div>
            </div>

            {/* Photos Direct Upload Card */}
            <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6 shadow-xs">
              <ImageUploader
                images={formData.images}
                onChange={(imgs) => set("images", imgs)}
                maxImages={6}
              />
            </div>
          </div>

          {/* Right Column (Fabric, Color & Visibility) */}
          <div className="space-y-6">
            {/* Fabric & Color */}
            <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6 shadow-xs space-y-4">
              <h3 className="text-[#1C241D] font-semibold text-sm border-b border-[#F0E8DC] pb-3">
                Fabric & Palette
              </h3>

              <div>
                <label className={labelCls}>Fabric</label>
                <input
                  type="text"
                  value={formData.fabric}
                  onChange={(e) => set("fabric", e.target.value)}
                  className={inputCls}
                  placeholder="e.g., Pure Mysore Silk / Organza"
                />
              </div>

              <div>
                <label className={labelCls}>Color / Shade</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => set("color", e.target.value)}
                  className={inputCls}
                  placeholder="e.g., Royal Peacock Blue & Gold"
                />
              </div>
            </div>

            {/* Visibility Settings */}
            <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6 shadow-xs space-y-4">
              <h3 className="text-[#1C241D] font-semibold text-sm border-b border-[#F0E8DC] pb-3">
                Storefront Visibility
              </h3>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-[#C6A15B] rounded"
                />
                <div>
                  <span className="text-[#1C241D] text-sm font-medium block">Active in Boutique</span>
                  <p className="text-[#5E7052] text-xs">Visible to patrons in the shop catalog</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => set("isFeatured", e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-[#C6A15B] rounded"
                />
                <div>
                  <span className="text-[#1C241D] text-sm font-medium block">Featured Saree</span>
                  <p className="text-[#5E7052] text-xs">Highlight on boutique homepage showcase</p>
                </div>
              </label>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#C6A15B] hover:bg-[#826530] text-[#1C241D] hover:text-white font-semibold py-3.5 rounded-xl text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? "Publishing Saree…" : "Publish Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
