"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Package, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatPrice, parseProductImages } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  images: any;
  category: { name: string } | null;
}

interface Category { id: string; name: string; }

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const LIMIT = 15;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set("search", search);
      if (categoryId) params.set("categoryId", categoryId);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search, categoryId, statusFilter]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(console.error);
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (e) { console.error(e); }
    finally { setDeleting(null); }
  };

  const handleToggle = async (id: string, field: "isActive" | "isFeatured", currentValue: boolean) => {
    setToggling(id + field);
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentValue }),
      });
      fetchProducts();
    } catch (e) { console.error(e); }
    finally { setToggling(null); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-5">
      {/* Top actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B89A]" size={16} />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#D4C5B0] rounded-lg focus:border-[#C6A15B] outline-none text-[#1C241D] bg-white"
          />
        </div>
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-sm border border-[#D4C5B0] rounded-lg focus:border-[#C6A15B] outline-none text-[#1C241D] bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-sm border border-[#D4C5B0] rounded-lg focus:border-[#C6A15B] outline-none text-[#1C241D] bg-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="featured">Featured</option>
        </select>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C6A15B] text-[#1C241D] rounded-lg text-sm font-semibold hover:bg-[#826530] hover:text-white transition-colors whitespace-nowrap"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E8E0D5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-[#C6A15B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-[#5E7052]">
            <Package className="mx-auto mb-3 text-[#D4C5B0]" size={40} />
            <p className="font-medium">No products found.</p>
            <Link href="/admin/products/new" className="inline-flex items-center gap-1.5 mt-3 text-[#C6A15B] text-sm hover:underline">
              <Plus size={14} /> Add your first product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F1E7] text-[#5E7052] text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-center">Featured</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8DC]">
                {products.map((p) => {
                  const imgs = parseProductImages(p.images);
                  return (
                    <tr key={p.id} className="hover:bg-[#FAF6F0]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#F8F1E7] overflow-hidden shrink-0 border border-[#E8E0D5]">
                            {imgs[0]
                              ? <img src={imgs[0]} alt={p.name} className="w-full h-full object-cover" />
                              : <div className="flex items-center justify-center h-full"><Package className="text-[#A8B89A]" size={18} /></div>
                            }
                          </div>
                          <div>
                            <div className="font-medium text-[#1C241D] max-w-[180px] truncate">{p.name}</div>
                            {p.sku && <div className="text-[#A8B89A] text-xs font-mono">{p.sku}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#43513B]">{p.category?.name || <span className="text-[#A8B89A]">—</span>}</td>
                      <td className="px-4 py-3 text-right font-medium text-[#826530]">{formatPrice(p.price)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-semibold ${p.stock === 0 ? "text-red-500" : p.stock <= 5 ? "text-amber-600" : "text-emerald-600"}`}>{p.stock}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(p.id, "isActive", p.isActive)}
                          disabled={toggling === p.id + "isActive"}
                          className="transition-colors"
                          title={p.isActive ? "Deactivate" : "Activate"}
                        >
                          {p.isActive
                            ? <ToggleRight size={22} className="text-emerald-500 hover:text-emerald-600" />
                            : <ToggleLeft size={22} className="text-[#C4B8A8] hover:text-[#A8B89A]" />
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(p.id, "isFeatured", p.isFeatured)}
                          disabled={toggling === p.id + "isFeatured"}
                          className="transition-colors"
                          title={p.isFeatured ? "Remove from featured" : "Mark as featured"}
                        >
                          {p.isFeatured
                            ? <ToggleRight size={22} className="text-[#C6A15B] hover:text-[#826530]" />
                            : <ToggleLeft size={22} className="text-[#C4B8A8] hover:text-[#A8B89A]" />
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1.5 text-[#5E7052] hover:text-[#C6A15B] hover:bg-[#F8F1E7] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={deleting === p.id}
                            className="p-1.5 text-[#A8B89A] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#F0E8DC]">
            <span className="text-xs text-[#5E7052]">
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} products
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-[#D4C5B0] rounded-lg disabled:opacity-40 hover:border-[#C6A15B] text-[#43513B]">
                <ChevronLeft size={15} />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-[#D4C5B0] rounded-lg disabled:opacity-40 hover:border-[#C6A15B] text-[#43513B]">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
