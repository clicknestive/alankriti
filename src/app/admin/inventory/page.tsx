"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Package, AlertTriangle, XCircle, CheckCircle, RefreshCw } from "lucide-react";
import { formatPrice, parseProductImages } from "@/lib/utils";

interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
  isActive: boolean;
  price: number;
  images: any;
  category: { name: string } | null;
}

interface InventorySummary {
  inStock: number;
  lowStock: number;
  outOfStock: number;
  total: number;
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [summary, setSummary] = useState<InventorySummary>({ inStock: 0, lowStock: 0, outOfStock: 0, total: 0 });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/inventory?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setSummary(data.summary || { inStock: 0, lowStock: 0, outOfStock: 0, total: 0 });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filter, search]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const startEdit = (p: InventoryProduct) => {
    setEditingId(p.id);
    setEditStock(String(p.stock));
  };

  const saveStock = async (id: string) => {
    const newStock = parseInt(editStock);
    if (isNaN(newStock) || newStock < 0) return;
    setSaving(true);
    try {
      await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, stock: newStock }),
      });
      setEditingId(null);
      fetchInventory();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const stockBadge = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", class: "bg-red-100 text-red-700", icon: XCircle };
    if (stock <= 5) return { label: "Low Stock", class: "bg-amber-100 text-amber-700", icon: AlertTriangle };
    return { label: "In Stock", class: "bg-emerald-100 text-emerald-700", icon: CheckCircle };
  };

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: summary.total, color: "bg-[#5E7052]", icon: Package },
          { label: "In Stock", value: summary.inStock, color: "bg-emerald-500", icon: CheckCircle },
          { label: "Low Stock", value: summary.lowStock, color: "bg-amber-500", icon: AlertTriangle },
          { label: "Out of Stock", value: summary.outOfStock, color: "bg-red-500", icon: XCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-[#E8E0D5] shadow-sm flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[#5E7052] text-xs">{label}</p>
              <p className="text-[#1C241D] text-xl font-semibold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B89A]" size={16} />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#D4C5B0] rounded-lg focus:border-[#C6A15B] outline-none text-[#1C241D] bg-white"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2.5 text-sm border border-[#D4C5B0] rounded-lg focus:border-[#C6A15B] outline-none text-[#1C241D] bg-white"
        >
          <option value="all">All Products</option>
          <option value="in-stock">In Stock (&gt;5)</option>
          <option value="low-stock">Low Stock (1–5)</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
        <button onClick={fetchInventory} className="px-3 py-2.5 border border-[#D4C5B0] rounded-lg text-[#5E7052] hover:border-[#C6A15B] hover:text-[#C6A15B] transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E8E0D5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-[#C6A15B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-[#5E7052]">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F1E7] text-[#5E7052] text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">SKU</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Update Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8DC]">
                {products.map((p) => {
                  const imgs = parseProductImages(p.images);
                  const badge = stockBadge(p.stock);
                  const BadgeIcon = badge.icon;
                  const isEditing = editingId === p.id;

                  return (
                    <tr key={p.id} className={`hover:bg-[#FAF6F0] ${p.stock === 0 ? "bg-red-50/40" : p.stock <= 5 ? "bg-amber-50/30" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#F8F1E7] overflow-hidden shrink-0">
                            {imgs[0] ? <img src={imgs[0]} alt={p.name} className="w-full h-full object-cover" /> : <Package className="m-auto mt-2 text-[#A8B89A]" size={18} />}
                          </div>
                          <span className="font-medium text-[#1C241D] line-clamp-1">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#5E7052] font-mono text-xs">{p.sku || "—"}</td>
                      <td className="px-4 py-3 text-[#43513B]">{p.category?.name || "—"}</td>
                      <td className="px-4 py-3 text-right text-[#826530] font-medium">{formatPrice(p.price)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-semibold text-base ${p.stock === 0 ? "text-red-600" : p.stock <= 5 ? "text-amber-600" : "text-emerald-600"}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
                          <BadgeIcon size={11} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center gap-1 justify-center">
                            <input
                              type="number"
                              min={0}
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                              className="w-16 text-center text-sm border border-[#C6A15B] rounded-lg px-2 py-1 outline-none text-[#1C241D]"
                              autoFocus
                              onKeyDown={(e) => { if (e.key === "Enter") saveStock(p.id); if (e.key === "Escape") setEditingId(null); }}
                            />
                            <button onClick={() => saveStock(p.id)} disabled={saving} className="px-2 py-1 bg-[#C6A15B] text-white rounded-lg text-xs font-medium hover:bg-[#826530] transition-colors disabled:opacity-50">
                              {saving ? "…" : "Save"}
                            </button>
                            <button onClick={() => setEditingId(null)} className="px-2 py-1 border border-[#D4C5B0] text-[#5E7052] rounded-lg text-xs hover:bg-[#F8F1E7] transition-colors">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(p)} className="px-3 py-1.5 text-xs border border-[#D4C5B0] text-[#43513B] rounded-lg hover:border-[#C6A15B] hover:text-[#826530] transition-colors">
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
