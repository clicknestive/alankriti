"use client";

import { useState, useEffect } from "react";
import { Search, CheckCircle, EyeOff, Flag, Trash2, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { formatDate, parseProductImages } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  isFlagged: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string };
  product: { id: string; name: string; images: any };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const LIMIT = 15;

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), filter });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/reviews?${params}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [page, filter, search]);

  const handleAction = async (id: string, action: "approve" | "hide" | "flag") => {
    setActing(id);
    try {
      await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      fetchReviews();
    } catch (e) { console.error(e); }
    finally { setActing(null); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this review?")) return;
    setActing(id);
    try {
      await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      fetchReviews();
    } catch (e) { console.error(e); }
    finally { setActing(null); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B89A]" size={16} />
          <input
            type="text"
            placeholder="Search reviews, products, customers…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#D4C5B0] rounded-lg focus:border-[#C6A15B] outline-none text-[#1C241D] bg-white"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-sm border border-[#D4C5B0] rounded-lg focus:border-[#C6A15B] outline-none text-[#1C241D] bg-white"
        >
          <option value="all">All Reviews</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 text-xs font-medium">
        <span className="px-3 py-1.5 bg-white border border-[#E8E0D5] rounded-full text-[#43513B]">{total} total</span>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-2 border-[#C6A15B] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-[#5E7052] bg-white rounded-xl border border-[#E8E0D5]">
          <Star className="mx-auto mb-3 text-[#D4C5B0]" size={36} />
          <p>No reviews found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => {
            const imgs = parseProductImages(r.product?.images);
            return (
              <div
                key={r.id}
                className={`bg-white rounded-xl border shadow-sm p-4 ${r.isFlagged ? "border-red-200 bg-red-50/30" : r.isApproved ? "border-emerald-200" : "border-amber-200 bg-amber-50/20"}`}
              >
                <div className="flex items-start gap-4">
                  {/* Product image */}
                  <div className="w-12 h-12 rounded-lg bg-[#F8F1E7] overflow-hidden shrink-0">
                    {imgs[0] ? <img src={imgs[0]} alt={r.product.name} className="w-full h-full object-cover" /> : null}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {/* Status badges */}
                      {r.isFlagged && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Flagged</span>
                      )}
                      {!r.isApproved && !r.isFlagged && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Pending</span>
                      )}
                      {r.isApproved && !r.isFlagged && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Approved</span>
                      )}
                      {/* Stars */}
                      <span className="text-[#C6A15B] text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    </div>

                    <p className="text-[#43513B] text-sm leading-relaxed mb-2">{r.comment}</p>

                    <div className="flex items-center gap-3 text-xs text-[#5E7052]">
                      <span><strong className="text-[#1C241D]">{r.user.name}</strong> · {r.user.email}</span>
                      <span>·</span>
                      <span>{r.product.name}</span>
                      <span>·</span>
                      <span>{formatDate(r.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 shrink-0">
                    {!r.isApproved && (
                      <button
                        onClick={() => handleAction(r.id, "approve")}
                        disabled={acting === r.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
                      >
                        <CheckCircle size={13} /> Approve
                      </button>
                    )}
                    {r.isApproved && (
                      <button
                        onClick={() => handleAction(r.id, "hide")}
                        disabled={acting === r.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
                      >
                        <EyeOff size={13} /> Hide
                      </button>
                    )}
                    {!r.isFlagged && (
                      <button
                        onClick={() => handleAction(r.id, "flag")}
                        disabled={acting === r.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors"
                      >
                        <Flag size={13} /> Flag
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={acting === r.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#5E7052]">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-[#D4C5B0] rounded-lg disabled:opacity-40 hover:border-[#C6A15B] text-[#43513B]"><ChevronLeft size={15} /></button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-[#D4C5B0] rounded-lg disabled:opacity-40 hover:border-[#C6A15B] text-[#43513B]"><ChevronRight size={15} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
