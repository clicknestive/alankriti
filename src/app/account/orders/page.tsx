'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Star,
  ChevronRight,
  ShoppingBag,
  RotateCcw,
  AlertTriangle,
  XCircle,
  Copy,
  Check
} from 'lucide-react';
import { formatPrice, formatDate, ORDER_STATUS_STEPS, getOrderStatusIndex } from '@/lib/utils';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  fabric?: string | null;
  colour?: string | null;
  price: number;
  quantity: number;
  total: number;
}

interface Order {
  id: string;
  totalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string;
  shippingAddressSnapshot: string;
  shippingCarrier?: string | null;
  trackingNumber?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { user, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const loadOrders = () => {
    if (user) {
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) {
            setOrders(data.orders);
          }
        })
        .catch(console.error)
        .finally(() => setIsFetching(false));
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const handleCopyTracking = (tracking: string) => {
    navigator.clipboard.writeText(tracking);
    setCopiedId(tracking);
    showToast('Tracking number copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const submitReturnRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrderId) return;
    setIsSubmittingReturn(true);

    try {
      const res = await fetch('/api/orders/return-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: returnOrderId,
          reason: returnReason,
        }),
      });

      const data = await res.json();
      setIsSubmittingReturn(false);

      if (res.ok) {
        showToast('Return request submitted. Our concierge will reach out within 24 hours.', 'success');
        setReturnOrderId(null);
        setReturnReason('');
        loadOrders();
      } else {
        showToast(data.error || 'Failed to submit return request', 'error');
      }
    } catch (err) {
      setIsSubmittingReturn(false);
      showToast('Network error submitting return request', 'error');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C6A15B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DCCF] pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#826530] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Patron Vault
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A3425]">
            My Order History & Tracking
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track live dispatch status, view courier AWB details, and manage your heirloom wardrobe.
          </p>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FAF6F0] border border-[#C6A15B] hover:bg-[#F3E9D5] text-[#826530] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shrink-0"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Explore New Weaves</span>
        </Link>
      </div>

      {isFetching ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#C6A15B] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E3DCCF] p-8 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FAF6F0] text-[#826530] flex items-center justify-center mx-auto border border-[#E3DCCF]">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#2A3425]">No Orders Placed Yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            You have not placed any orders yet. Discover our pure Mysore and Kanjivaram silk weaves to begin your bespoke collection.
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 bg-[#5E7052] text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#43513B]"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => {
            const isNonStandard = ['CANCELLED', 'RETURN REQUESTED', 'RETURNED', 'REFUNDED'].includes(order.orderStatus);
            const currentStepIdx = getOrderStatusIndex(order.orderStatus);
            let address: any = {};
            try {
              address = JSON.parse(order.shippingAddressSnapshot);
            } catch (e) {}

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DCCF] shadow-sm space-y-6"
              >
                {/* Top Info Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
                  <div>
                    <span className="text-[11px] text-stone-400 font-medium block">Order Reference</span>
                    <span className="font-mono text-sm font-bold text-[#2A3425]">{order.id}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-stone-400 font-medium block">Order Date</span>
                    <span className="text-xs font-semibold text-[#2A3425]">{formatDate(order.createdAt)}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-stone-400 font-medium block">Total Amount</span>
                    <span className="text-sm font-bold text-[#826530] font-serif">{formatPrice(order.totalAmount)}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-stone-400 font-medium block">Payment Status</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      order.paymentStatus === 'PAID' ? 'bg-[#E6EFE2] text-[#43513B]' :
                      order.paymentStatus === 'REFUNDED' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {order.paymentStatus} ({order.paymentMethod})
                    </span>
                  </div>
                </div>

                {/* Status Visualizer */}
                {isNonStandard ? (
                  <div className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4 ${
                    order.orderStatus === 'CANCELLED' ? 'bg-red-50 border-red-200 text-red-700' :
                    order.orderStatus === 'RETURN REQUESTED' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                    order.orderStatus === 'RETURNED' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                    'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    <div className="flex items-center gap-3">
                      {order.orderStatus === 'CANCELLED' && <XCircle className="w-6 h-6 text-red-500 shrink-0" />}
                      {order.orderStatus === 'RETURN REQUESTED' && <RotateCcw className="w-6 h-6 text-amber-600 shrink-0" />}
                      {order.orderStatus === 'RETURNED' && <CheckCircle className="w-6 h-6 text-purple-600 shrink-0" />}
                      {order.orderStatus === 'REFUNDED' && <Sparkles className="w-6 h-6 text-emerald-600 shrink-0" />}
                      <div>
                        <h4 className="font-bold text-sm">Status: {order.orderStatus}</h4>
                        <p className="text-xs opacity-90 mt-0.5">
                          {order.orderStatus === 'CANCELLED' && 'This order has been cancelled and inventory released.'}
                          {order.orderStatus === 'RETURN REQUESTED' && 'Our boutique concierge is verifying your return request.'}
                          {order.orderStatus === 'RETURNED' && 'The saree has been received back at our artisan atelier.'}
                          {order.orderStatus === 'REFUNDED' && 'A full refund has been credited back to your original payment channel.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#FAF6F0] p-4 sm:p-6 rounded-2xl border border-[#E3DCCF] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#826530] flex items-center gap-1.5">
                        <Truck className="w-4 h-4" /> Live Tracking Timeline: {order.orderStatus}
                      </span>
                    </div>

                    {/* Horizontal Timeline Bar */}
                    <div className="relative pt-2">
                      <div className="hidden sm:grid grid-cols-7 gap-1 text-center relative z-10">
                        {ORDER_STATUS_STEPS.map((step, idx) => {
                          const isDone = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;

                          return (
                            <div key={step} className="flex flex-col items-center">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                  isDone
                                    ? 'bg-[#5E7052] text-white shadow-sm'
                                    : 'bg-white text-stone-300 border border-stone-200'
                                } ${isCurrent ? 'ring-4 ring-[#C6A15B]/40 scale-110' : ''}`}
                              >
                                {isDone ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                              </div>
                              <span
                                className={`text-[9px] mt-1.5 font-semibold uppercase leading-tight ${
                                  isCurrent
                                    ? 'text-[#826530] font-bold'
                                    : isDone
                                    ? 'text-[#2A3425]'
                                    : 'text-stone-400'
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Mobile Compact Status */}
                      <div className="sm:hidden flex items-center gap-3 bg-white p-3 rounded-xl border border-stone-200">
                        <div className="w-8 h-8 rounded-full bg-[#5E7052] text-white flex items-center justify-center">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#2A3425]">{order.orderStatus}</p>
                          <p className="text-[10px] text-stone-500">Step {currentStepIdx + 1} of 7 in dispatch workflow</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Courier & Tracking Dispatch Bar */}
                {order.shippingCarrier && (
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#F8F1E7] rounded-2xl border border-[#C6A15B]/40 text-xs text-[#2A3425]">
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-[#826530] shrink-0" />
                      <div>
                        <span className="font-semibold text-[#826530]">Insured Courier Partner:</span>{' '}
                        <strong>{order.shippingCarrier}</strong>
                        {order.trackingNumber && (
                          <span className="ml-2 inline-flex items-center gap-1.5 font-mono bg-white px-2 py-0.5 rounded border border-[#E3DCCF]">
                            AWB: <strong>{order.trackingNumber}</strong>
                            <button
                              onClick={() => handleCopyTracking(order.trackingNumber!)}
                              className="text-stone-400 hover:text-[#826530] transition-colors"
                              title="Copy Tracking AWB"
                            >
                              {copiedId === order.trackingNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Ordered Items List */}
                <div className="space-y-3">
                  <h4 className="font-serif text-sm font-bold text-[#2A3425]">
                    Items in this Curation ({order.items.length})
                  </h4>

                  <div className="divide-y divide-stone-100">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-14 h-18 rounded-lg overflow-hidden shrink-0 bg-[#F8F1E7]">
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div>
                            <Link
                              href={`/product/${item.productSlug}`}
                              className="font-serif text-sm font-semibold text-[#2A3425] hover:text-[#826530]"
                            >
                              {item.productName}
                            </Link>
                            <p className="text-xs text-stone-500">
                              Qty: {item.quantity} • {item.fabric || 'Pure Silk'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-[#2A3425] block">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          <Link
                            href={`/product/${item.productSlug}#reviews`}
                            className="inline-flex items-center gap-1 text-[11px] text-[#826530] hover:underline font-medium mt-1"
                          >
                            <Star className="w-3 h-3 fill-[#C6A15B] text-[#C6A15B]" />
                            <span>Write Review</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Bar: Shipping Address & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-100">
                  {address?.fullName && (
                    <div className="text-xs text-stone-600 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#826530] shrink-0" />
                      <span>
                        <strong>Shipped to:</strong> {address.fullName}, {address.city}, {address.state} - {address.pincode}
                      </span>
                    </div>
                  )}

                  {/* Return Request Button for Delivered Orders */}
                  {order.orderStatus === 'DELIVERED' && (
                    <button
                      onClick={() => setReturnOrderId(order.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-stone-300 hover:border-[#826530] text-stone-700 hover:text-[#826530] rounded-xl text-xs font-semibold transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Request Return</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Return Request Modal */}
      {returnOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-[#E3DCCF] shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#2A3425]">
                Request Boutique Return
              </h3>
              <button
                onClick={() => setReturnOrderId(null)}
                className="text-stone-400 hover:text-stone-700 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Order Reference: <strong className="font-mono text-[#2A3425]">{returnOrderId}</strong>.
              All Alankriti sarees may be returned within 7 days of delivery provided the Silk Mark tag remains intact.
            </p>

            <form onSubmit={submitReturnRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2A3425] mb-1">
                  Reason for Return
                </label>
                <textarea
                  required
                  rows={3}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="e.g., Color variation under lighting, sizing adjustment required..."
                  className="w-full text-xs p-3 border border-[#BDCFB1] rounded-xl focus:ring-1 focus:ring-[#826530] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnOrderId(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="px-5 py-2.5 bg-[#826530] hover:bg-[#684f23] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isSubmittingReturn ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
