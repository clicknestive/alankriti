'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Printer, Sparkles, MapPin, Calendar, Clock } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

interface StepConfirmationProps {
  order: {
    id: string;
    totalAmount: number;
    paymentStatus: string;
    orderStatus: string;
    paymentMethod: string;
    createdAt: string | Date;
    items: Array<{
      productName: string;
      productImage: string;
      fabric?: string | null;
      colour?: string | null;
      quantity: number;
      price: number;
    }>;
    shippingAddress: {
      fullName: string;
      phone: string;
      street: string;
      landmark?: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
}

export default function StepConfirmation({ order }: StepConfirmationProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Success Banner */}
      <div className="text-center bg-[#F8F1E7] p-8 rounded-3xl border border-[#C6A15B]/50 shadow-sm relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-[#E6EFE2] text-[#5E7052] flex items-center justify-center mx-auto mb-4 border border-[#BDCFB1]">
          <CheckCircle className="w-8 h-8" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#826530]">
          Order Confirmed • Alankriti Couture Privé
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A3425] mt-1">
          Thank You For Your Patronage
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto mt-2 leading-relaxed">
          Your bespoke saree order has been placed into our artisanal dispatch queue with certified Silk Mark authentication.
        </p>

        <div className="inline-block mt-4 px-4 py-2 bg-[#2A3425] text-[#F8F1E7] rounded-xl font-mono text-sm tracking-wider font-bold shadow-sm">
          Order Reference: {order.id}
        </div>
      </div>

      {/* Order Status Tracker */}
      <div className="bg-white p-6 rounded-2xl border border-[#E3DCCF] shadow-sm">
        <h4 className="font-serif text-base font-bold text-[#2A3425] mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#826530]" /> Current Order Progress
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-[#E6EFE2] rounded-xl border border-[#A8B89A]">
            <span className="text-[10px] text-[#43513B] uppercase font-bold block">Status</span>
            <span className="text-xs font-bold text-[#2A3425] mt-0.5 block">{order.orderStatus}</span>
          </div>
          <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E3DCCF]">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Payment</span>
            <span className="text-xs font-bold text-[#5E7052] mt-0.5 block">{order.paymentStatus}</span>
          </div>
          <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E3DCCF]">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Method</span>
            <span className="text-xs font-bold text-[#2A3425] mt-0.5 block">{order.paymentMethod}</span>
          </div>
          <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E3DCCF]">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Order Placed On</span>
            <span className="text-xs font-bold text-[#2A3425] mt-0.5 block">{formatDate(order.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Destination & Items Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E3DCCF] shadow-sm">
          <h4 className="font-serif text-base font-bold text-[#2A3425] mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#826530]" /> Delivery Address
          </h4>
          <p className="text-xs font-bold text-[#2A3425]">{order.shippingAddress.fullName}</p>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
            {order.shippingAddress.street}, {order.shippingAddress.landmark ? `${order.shippingAddress.landmark}, ` : ''}
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
          </p>
          <p className="text-xs text-stone-500 mt-2">Mobile: {order.shippingAddress.phone}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DCCF] shadow-sm">
          <h4 className="font-serif text-base font-bold text-[#2A3425] mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#826530]" /> Order Summary
          </h4>
          <div className="space-y-2">
            {order.items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-xs text-stone-700">
                <span className="truncate pr-2">
                  {it.productName} (x{it.quantity})
                </span>
                <span className="font-semibold text-[#2A3425] shrink-0">
                  {formatPrice(it.price * it.quantity)}
                </span>
              </div>
            ))}
            <div className="pt-3 mt-2 border-t border-stone-100 flex justify-between text-sm font-bold text-[#2A3425]">
              <span>Total Paid</span>
              <span className="text-[#826530]">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#BDCFB1] hover:bg-[#FAF6F0] text-[#2A3425] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          <Printer className="w-4 h-4 text-stone-500" />
          <span>Print Receipt</span>
        </button>

        <div className="flex gap-3">
          <Link
            href="/account/orders"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FAF6F0] border border-[#C6A15B] hover:bg-[#F3E9D5] text-[#826530] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <span>View All Orders</span>
          </Link>
          <Link
            href="/shop"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#5E7052] hover:bg-[#43513B] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
