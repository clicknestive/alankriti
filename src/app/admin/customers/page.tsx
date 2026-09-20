"use client";

import { useState, useEffect } from "react";
import { Search, Eye, UserX, UserCheck, ChevronLeft, ChevronRight, X, ShoppingBag, Star, MapPin } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  isBlocked: boolean;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

interface CustomerDetail extends Customer {
  addresses: { id: string; name: string; line1: string; city: string; state: string; pincode: string }[];
  orders: { id: string; status: string; totalAmount: number; createdAt: string }[];
  reviews: { id: string; rating: number; comment: string; product: { name: string }; createdAt: string }[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const LIMIT = 15;

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set("q", search);
      const res = await fetch(`/api/admin/customers?${params}`);
      const data = await res.json();
      setCustomers(data.customers || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, [page, search]);

  const openDetail = async (id: string) => {
    setLoadingDetail(true);
    setSelectedCustomer(null);
    try {
      const res = await fetch(`/api/admin/customers/${id}`);
      const data = await res.json();
      setSelectedCustomer(data.customer);
    } catch (e) { console.error(e); }
    finally { setLoadingDetail(false); }
  };

  const handleToggleBlock = async (id: string, currentlyBlocked: boolean) => {
    if (!window.confirm(`${currentlyBlocked ? "Unblock" : "Block"} this customer?`)) return;
    setToggling(id);
    try {
      await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !currentlyBlocked }),
      });
      fetchCustomers();
      if (selectedCustomer?.id === id) {
        setSelectedCustomer((prev) => prev ? { ...prev, isBlocked: !currentlyBlocked } : prev);
      }
    } catch (e) { console.error(e); }
    finally { setToggling(null); }
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
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#D4C5B0] rounded-lg focus:border-[#C6A15B] outline-none text-[#1C241D] bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E8E0D5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-[#C6A15B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 text-[#5E7052]">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F1E7] text-[#5E7052] text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-center">Orders</th>
                  <th className="px-4 py-3 text-right">Total Spent</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Joined</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8DC]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF6F0]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#1C241D]">{c.name}</div>
                      <div className="text-[#5E7052] text-xs">{c.email}</div>
                    </td>
                    <td className="px-4 py-3 text-[#43513B]">{c.mobile || "—"}</td>
                    <td className="px-4 py-3 text-center text-[#43513B]">{c.totalOrders}</td>
                    <td className="px-4 py-3 text-right font-medium text-[#826530]">{formatPrice(c.totalSpent)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.isBlocked ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {c.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-[#5E7052] text-xs">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openDetail(c.id)} className="p-1.5 text-[#5E7052] hover:text-[#C6A15B] hover:bg-[#F8F1E7] rounded-lg transition-colors" title="View">
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleToggleBlock(c.id, c.isBlocked)}
                          disabled={toggling === c.id}
                          className={`p-1.5 rounded-lg transition-colors ${c.isBlocked ? "text-emerald-600 hover:bg-emerald-50" : "text-red-500 hover:bg-red-50"}`}
                          title={c.isBlocked ? "Unblock" : "Block"}
                        >
                          {c.isBlocked ? <UserCheck size={15} /> : <UserX size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#F0E8DC]">
            <span className="text-xs text-[#5E7052]">
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-[#D4C5B0] rounded-lg disabled:opacity-40 hover:border-[#C6A15B] text-[#43513B]"><ChevronLeft size={15} /></button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-[#D4C5B0] rounded-lg disabled:opacity-40 hover:border-[#C6A15B] text-[#43513B]"><ChevronRight size={15} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {(loadingDetail || selectedCustomer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E0D5]">
              <h2 className="text-[#1C241D] font-semibold">Customer Profile</h2>
              <button onClick={() => setSelectedCustomer(null)} className="text-[#5E7052] hover:text-[#1C241D]"><X size={18} /></button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {loadingDetail ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-7 h-7 border-2 border-[#C6A15B] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : selectedCustomer ? (
                <div className="space-y-5">
                  {/* Basic info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-[#1C241D] font-semibold text-lg">{selectedCustomer.name}</h3>
                      <p className="text-[#5E7052] text-sm">{selectedCustomer.email}</p>
                      {selectedCustomer.mobile && <p className="text-[#5E7052] text-sm">{selectedCustomer.mobile}</p>}
                      <p className="text-[#A8B89A] text-xs mt-1">Member since {formatDate(selectedCustomer.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-[#826530]">{formatPrice(selectedCustomer.totalSpent)}</div>
                      <div className="text-[#5E7052] text-xs">{selectedCustomer.totalOrders} orders</div>
                      <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${selectedCustomer.isBlocked ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {selectedCustomer.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </div>
                  </div>

                  {/* Block/Unblock button */}
                  <button
                    onClick={() => handleToggleBlock(selectedCustomer.id, selectedCustomer.isBlocked)}
                    disabled={toggling === selectedCustomer.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCustomer.isBlocked ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200" : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"}`}
                  >
                    {selectedCustomer.isBlocked ? <><UserCheck size={15} /> Unblock Customer</> : <><UserX size={15} /> Block Customer</>}
                  </button>

                  {/* Addresses */}
                  {selectedCustomer.addresses.length > 0 && (
                    <div>
                      <h4 className="text-[#1C241D] font-medium text-sm mb-2 flex items-center gap-1.5"><MapPin size={14} className="text-[#C6A15B]" /> Addresses</h4>
                      {selectedCustomer.addresses.map((a) => (
                        <div key={a.id} className="text-sm text-[#43513B] bg-[#FAF6F0] rounded-lg px-3 py-2 mb-2">
                          {a.name} · {a.line1}, {a.city}, {a.state} – {a.pincode}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Orders */}
                  {selectedCustomer.orders.length > 0 && (
                    <div>
                      <h4 className="text-[#1C241D] font-medium text-sm mb-2 flex items-center gap-1.5"><ShoppingBag size={14} className="text-[#C6A15B]" /> Recent Orders</h4>
                      <div className="space-y-1.5">
                        {selectedCustomer.orders.slice(0, 5).map((o) => (
                          <div key={o.id} className="flex items-center justify-between text-sm bg-[#FAF6F0] rounded-lg px-3 py-2">
                            <span className="text-[#43513B] font-mono text-xs">{o.id}</span>
                            <span className="text-[#5E7052] text-xs">{o.status}</span>
                            <span className="text-[#826530] font-medium">{formatPrice(o.totalAmount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reviews */}
                  {selectedCustomer.reviews.length > 0 && (
                    <div>
                      <h4 className="text-[#1C241D] font-medium text-sm mb-2 flex items-center gap-1.5"><Star size={14} className="text-[#C6A15B]" /> Reviews</h4>
                      <div className="space-y-1.5">
                        {selectedCustomer.reviews.map((r) => (
                          <div key={r.id} className="text-sm bg-[#FAF6F0] rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[#C6A15B]">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                              <span className="text-[#5E7052] text-xs">{r.product.name}</span>
                            </div>
                            <p className="text-[#43513B] text-xs">{r.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
