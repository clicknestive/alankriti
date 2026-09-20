"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { parseProductImages } from "@/lib/utils";
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
  stock: "0",
  categoryId: "",
  fabric: "",
  color: "",
  isActive: true,
  isFeatured: false,
  images: [],
};

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState<FormData>(defaultForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoadingProduct(true);
    fetch(`/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const p = data.product;
        if (!p) return;
        const imgs = parseProductImages(p.images);
        setFormData({
          name: p.name || "",
          description: p.description || "",
          price: String(p.price || ""),
          compareAtPrice: p.originalPrice ? String(p.originalPrice) : (p.compareAtPrice ? String(p.compareAtPrice) : ""),
          stock: String(p.stock ?? 0),
          categoryId: p.categoryId || "",
          fabric: p.fabric || "",
          color: p.colour || p.color || "",
          isActive: p.isActive ?? true,
          isFeatured: p.isFeatured ?? false,
          images: imgs,
        });
      })
      .catch(console.error)
      .finally(() => setLoadingProduct(false));
  }, [id]);

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
        originalPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
        stock: parseInt(formData.stock) || 0,
        categoryId: formData.categoryId,
        fabric: formData.fabric.trim() || undefined,
        colour: formData.color.trim() || undefined,
        color: formData.color.trim() || undefined,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        imageUrls: validImages,
        images: validImages,
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update product");
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

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#C6A15B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          <h2 className="text-[#1C241D] font-serif font-bold text-xl">Edit Saree Details</h2>
          <p className="text-xs text-[#5E7052]">Modify pricing, inventory, photos, and presentation</p>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-fadeIn">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Basic Info + Photos) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
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
                  <option value="">— Select Category —</option>
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
                  placeholder="e.g., Pure Kanjivaram Silk"
                />
              </div>

              <div>
                <label className={labelCls}>Color / Shade</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => set("color", e.target.value)}
                  className={inputCls}
                  placeholder="e.g., Deep Crimson & Antique Gold"
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
              {submitting ? "Saving Changes…" : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
