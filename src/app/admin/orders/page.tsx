"use client";

import { useState, useEffect } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, X, Package, RotateCcw, ShieldAlert, CreditCard } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

interface PaymentRecord {
  id: string;
  paymentId?: string | null;
  razorpayOrderId: string;
  amount: number;
  status: string;
  refundId?: string | null;
  createdAt: string;
}

interface Order {
  id: string;
  status?: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  customerNotes?: string | null;
  adminNotes?: string;
  user: { name: string; email: string };
  items: OrderItem[];
  payment?: PaymentRecord | null;
  shippingAddress?: {
    name: string; line1: string; city: string; state: string; pincode: string;
  } | null;
}

interface UpdateForm {
  orderStatus: string;
  paymentStatus: string;
  shippingCarrier: string;
  trackingNumber: string;
  adminNotes: string;
}

const ORDER_STATUSES = [
  "ORDER PLACED",
  "PAYMENT CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT FOR DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURN REQUESTED",
  "RETURNED",
  "REFUNDED",
];

const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED"];

function statusBadge(status: string): string {
  const map: Record<string, string> = {
    "ORDER PLACED": "bg-amber-50 text-amber-700 border-amber-200",
    "PAYMENT CONFIRMED": "bg-teal-50 text-teal-700 border-teal-200",
    "PROCESSING": "bg-blue-50 text-blue-700 border-blue-200",
    "PACKED": "bg-cyan-50 text-cyan-700 border-cyan-200",
    "SHIPPED": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "OUT FOR DELIVERY": "bg-orange-50 text-orange-700 border-orange-200",
    "DELIVERED": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "CANCELLED": "bg-red-50 text-red-700 border-red-200",
    "RETURN REQUESTED": "bg-yellow-50 text-yellow-800 border-yellow-300",
    "RETURNED": "bg-purple-50 text-purple-700 border-purple-200",
    "REFUNDED": "bg-rose-50 text-rose-700 border-rose-200",
  };
  return map[status] || "bg-gray-100 text-gray-600 border-gray-200";
}

function paymentBadge(status: string): string {
  const map: Record<string, string> = {
    PAID: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    FAILED: "bg-red-100 text-red-700",
    CANCELLED: "bg-stone-100 text-stone-600",
    REFUNDED: "bg-purple-100 text-purple-700",
  };
  return map[status] || "bg-gray-100 text-gray-600";
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [refundingOrder, setRefundingOrder] = useState(false);
  const [updateForm, setUpdateForm] = useState<UpdateForm>({
    orderStatus: "", paymentStatus: "", shippingCarrier: "", trackingNumber: "", adminNotes: "",
  });

  const LIMIT = 12;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (paymentFilter !== "all") params.set("paymentStatus", paymentFilter);
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, search, statusFilter, paymentFilter]);

  const openDetail = async (id: string) => {
    setLoadingDetail(true);
    setSelectedOrder(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      const data = await res.json();
      const order = data.order;
      setSelectedOrder(order);
      setUpdateForm({
        orderStatus: order.orderStatus || order.status || "",
        paymentStatus: order.paymentStatus || "",
        shippingCarrier: order.shippingCarrier || "",
        trackingNumber: order.trackingNumber || "",
        adminNotes: order.adminNotes || "",
      });
    } catch (e) { console.error(e); }
    finally { setLoadingDetail(false); }
  };

  const handleUpdate = async () => {
    if (!selectedOrder) return;
    setUpdatingOrder(true);
    try {
      await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateForm),
      });
      setSelectedOrder(null);
      fetchOrders();
    } catch (e) { console.error(e); }
    finally { setUpdatingOrder(false); }
  };

  const handleRefund = async () => {
    if (!selectedOrder) return;
    const confirm = window.confirm(
      `Issue full Razorpay refund of ${formatPrice(selectedOrder.totalAmount)} for Order ${selectedOrder.id}?\n\nThis will credit the customer, set status to REFUNDED, and restock products.`
    );
    if (!confirm) return;

    setRefundingOrder(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refundReason: "Admin-initiated customer refund from dashboard",
          restockItems: true,
        }),
      });
      const data = await res.json();
      setRefundingOrder(false);

      if (res.ok) {
        alert(`Refund processed successfully. Refund ID: ${data.refund?.id || 'Processed'}`);
        setSelectedOrder(null);
        fetchOrders();
      } else {
        alert(data.error || "Failed to process refund");
      }
    } catch (e) {
      setRefundingOrder(false);
      alert("Network error processing refund");
    }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const inputCls = "w-full border border-[#D4C5B0] focus:border-[#C6A15B] rounded-lg px-3 py-2 text-sm text-[#1C241D] outline-none bg-white transition-colors";

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B89A]" size={16} />
          <input
            type="text"
            placeholder="Search by order ID, customer name, email, or tracking…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#D4C5B0] rounded-lg focus:border-[#C6A15B] outline-none text-[#1C241D] bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-sm border border-[#D4C5B0] rounded-lg focus:border-[#C6A15B] outline-none text-[#1C241D] bg-white"
        >
          <option value="all">All Statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-sm border border-[#D4C5B0] rounded-lg focus:border-[#C6A15B] outline-none text-[#1C241D] bg-white"
        >
          <option value="all">All Payments</option>
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E8E0D5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-[#C6A15B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-[#5E7052]">
            <Package className="mx-auto mb-3 text-[#D4C5B0]" size={40} />
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F1E7] text-[#5E7052] text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Payment</th>
                  <th className="px-4 py-3 text-center">Date</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8DC]">
                {orders.map((o) => {
                  const currentStatus = o.orderStatus || o.status || "ORDER PLACED";
                  return (
                    <tr key={o.id} className="hover:bg-[#FAF6F0]">
                      <td className="px-4 py-3 font-mono text-xs text-[#43513B] font-medium">{o.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#1C241D]">{o.user.name}</div>
                        <div className="text-[#5E7052] text-xs">{o.user.email}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#826530]">{formatPrice(o.totalAmount)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge(currentStatus)}`}>
                          {currentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentBadge(o.paymentStatus)}`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-[#5E7052] text-xs">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => openDetail(o.id)} className="p-1.5 text-[#5E7052] hover:text-[#C6A15B] hover:bg-[#F8F1E7] rounded-lg transition-colors" title="View order">
                          <Eye size={15} />
                        </button>
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
            <span className="text-xs text-[#5E7052]">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} orders</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-[#D4C5B0] rounded-lg disabled:opacity-40 hover:border-[#C6A15B] text-[#43513B]"><ChevronLeft size={15} /></button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-[#D4C5B0] rounded-lg disabled:opacity-40 hover:border-[#C6A15B] text-[#43513B]"><ChevronRight size={15} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {(loadingDetail || selectedOrder) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E0D5]">
              <div>
                <h2 className="text-[#1C241D] font-semibold text-base">
                  {selectedOrder ? `Order Reference: ${selectedOrder.id}` : "Loading…"}
                </h2>
                {selectedOrder && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block border ${statusBadge(selectedOrder.orderStatus || selectedOrder.status || '')}`}>
                    {selectedOrder.orderStatus || selectedOrder.status}
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-[#5E7052] hover:text-[#1C241D]"><X size={18} /></button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {loadingDetail ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-7 h-7 border-2 border-[#C6A15B] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : selectedOrder ? (
                <>
                  {/* Customer + Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="bg-[#FAF6F0] rounded-xl p-4">
                      <p className="text-[#5E7052] text-xs font-medium uppercase tracking-wide mb-2">Customer</p>
                      <p className="font-medium text-[#1C241D]">{selectedOrder.user.name}</p>
                      <p className="text-[#5E7052] text-xs">{selectedOrder.user.email}</p>
                      <p className="text-[#5E7052] text-xs mt-1">Placed: {formatDate(selectedOrder.createdAt)}</p>
                    </div>
                    {selectedOrder.shippingAddress && (
                      <div className="bg-[#FAF6F0] rounded-xl p-4">
                        <p className="text-[#5E7052] text-xs font-medium uppercase tracking-wide mb-2">Shipping Destination</p>
                        <p className="font-medium text-[#1C241D]">{selectedOrder.shippingAddress.name}</p>
                        <p className="text-[#43513B] text-xs">{selectedOrder.shippingAddress.line1}</p>
                        <p className="text-[#43513B] text-xs">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} – {selectedOrder.shippingAddress.pincode}</p>
                      </div>
                    )}
                  </div>

                  {/* Payment Record Audit Card */}
                  {selectedOrder.payment && (
                    <div className="p-4 bg-[#F8F1E7] rounded-xl border border-[#C6A15B]/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#826530] flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4" /> Razorpay Payment Record
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${paymentBadge(selectedOrder.payment.status)}`}>
                          {selectedOrder.payment.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-stone-400 block text-[10px]">Payment ID</span>
                          <span className="font-mono font-medium text-[#2A3425]">{selectedOrder.payment.paymentId || 'Pending'}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px]">Razorpay Order ID</span>
                          <span className="font-mono font-medium text-[#2A3425]">{selectedOrder.payment.razorpayOrderId}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px]">Captured Amount</span>
                          <span className="font-bold text-[#826530]">{formatPrice(selectedOrder.payment.amount)}</span>
                        </div>
                      </div>
                      {selectedOrder.payment.refundId && (
                        <div className="text-xs text-purple-700 bg-purple-50 p-2 rounded border border-purple-200 mt-1">
                          <strong>Refund Reference:</strong> {selectedOrder.payment.refundId}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Customer Notes / Return Reason */}
                  {selectedOrder.customerNotes && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                      <strong>Customer Notes / Return Inquiry:</strong> {selectedOrder.customerNotes}
                    </div>
                  )}

                  {/* Order items */}
                  <div>
                    <p className="text-[#5E7052] text-xs font-medium uppercase tracking-wide mb-2">Order Items</p>
                    <div className="border border-[#E8E0D5] rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-[#F8F1E7]">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs text-[#5E7052]">Product</th>
                            <th className="px-3 py-2 text-center text-xs text-[#5E7052]">Qty</th>
                            <th className="px-3 py-2 text-right text-xs text-[#5E7052]">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0E8DC]">
                          {selectedOrder.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-3 py-2 text-[#43513B]">{item.productName}</td>
                              <td className="px-3 py-2 text-center text-[#5E7052]">{item.quantity}</td>
                              <td className="px-3 py-2 text-right font-medium text-[#826530]">{formatPrice(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t border-[#E8E0D5]">
                          <tr>
                            <td colSpan={2} className="px-3 py-2 text-right font-semibold text-[#1C241D] text-sm">Total</td>
                            <td className="px-3 py-2 text-right font-bold text-[#826530]">{formatPrice(selectedOrder.totalAmount)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Update form */}
                  <div>
                    <p className="text-[#5E7052] text-xs font-medium uppercase tracking-wide mb-3">Manage Order & Logistics</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[#5E7052] text-xs block mb-1">Order Status</label>
                        <select
                          value={updateForm.orderStatus}
                          onChange={(e) => setUpdateForm((f) => ({ ...f, orderStatus: e.target.value }))}
                          className={inputCls}
                        >
                          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[#5E7052] text-xs block mb-1">Payment Status</label>
                        <select
                          value={updateForm.paymentStatus}
                          onChange={(e) => setUpdateForm((f) => ({ ...f, paymentStatus: e.target.value }))}
                          className={inputCls}
                        >
                          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[#5E7052] text-xs block mb-1">Shipping Carrier</label>
                        <input
                          type="text"
                          value={updateForm.shippingCarrier}
                          onChange={(e) => setUpdateForm((f) => ({ ...f, shippingCarrier: e.target.value }))}
                          className={inputCls}
                          placeholder="BlueDart Express, Delhivery…"
                        />
                      </div>
                      <div>
                        <label className="text-[#5E7052] text-xs block mb-1">Tracking Number (AWB)</label>
                        <input
                          type="text"
                          value={updateForm.trackingNumber}
                          onChange={(e) => setUpdateForm((f) => ({ ...f, trackingNumber: e.target.value }))}
                          className={inputCls}
                          placeholder="BD89271923IN"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[#5E7052] text-xs block mb-1">Internal Admin Notes</label>
                        <textarea
                          rows={2}
                          value={updateForm.adminNotes}
                          onChange={(e) => setUpdateForm((f) => ({ ...f, adminNotes: e.target.value }))}
                          className={inputCls + " resize-none"}
                          placeholder="Internal fulfillment or customer notes…"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Footer Actions */}
            {selectedOrder && (
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-[#E8E0D5] bg-[#FAF6F0]/40">
                {/* Refund Button */}
                {selectedOrder.paymentStatus === 'PAID' || selectedOrder.orderStatus === 'RETURN REQUESTED' ? (
                  <button
                    type="button"
                    onClick={handleRefund}
                    disabled={refundingOrder}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{refundingOrder ? "Processing Refund..." : "Issue Full Refund (Razorpay)"}</span>
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 border border-[#D4C5B0] text-[#5E7052] rounded-xl text-sm hover:bg-[#F8F1E7] transition-colors">
                    Close
                  </button>
                  <button onClick={handleUpdate} disabled={updatingOrder} className="px-6 py-2 bg-[#C6A15B] text-[#1C241D] font-semibold rounded-xl text-sm hover:bg-[#826530] hover:text-white transition-colors disabled:opacity-50">
                    {updatingOrder ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
