'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ShieldCheck, Award, Sparkles } from 'lucide-react';
import { CartItem } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

interface StepSummaryProps {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  customerData: {
    name: string;
    email: string;
    mobile: string;
  };
  addressData: {
    fullName: string;
    phone: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
  onNext: () => void;
  onBack: () => void;
}

export default function StepSummary({
  items,
  subtotal,
  discount,
  shipping,
  total,
  customerData,
  addressData,
  onNext,
  onBack,
}: StepSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-[#FAF6F0] pb-4">
        <h3 className="font-serif text-xl font-bold text-[#2A3425]">
          3. Order Curation Review
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Review your selected artisanal sarees and delivery address prior to final authorization.
        </p>
      </div>

      {/* Customer & Address Review Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-[#FAF6F0] rounded-xl border border-[#E3DCCF]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#826530] block mb-1">
            Patron Details
          </span>
          <p className="text-xs font-semibold text-[#2A3425]">{customerData.name}</p>
          <p className="text-xs text-stone-600">{customerData.email}</p>
          <p className="text-xs text-stone-600">{customerData.mobile}</p>
        </div>

        <div className="p-4 bg-[#FAF6F0] rounded-xl border border-[#E3DCCF]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#826530] block mb-1">
            Shipping Destination
          </span>
          <p className="text-xs font-semibold text-[#2A3425]">{addressData.fullName}</p>
          <p className="text-xs text-stone-600 leading-relaxed">
            {addressData.street}, {addressData.landmark ? `${addressData.landmark}, ` : ''}
            {addressData.city}, {addressData.state} - {addressData.pincode}
          </p>
          <p className="text-xs text-stone-600">Contact: {addressData.phone}</p>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        <h4 className="font-serif text-base font-bold text-[#2A3425]">
          Selected Sarees ({items.length})
        </h4>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 p-3 bg-white rounded-xl border border-[#E3DCCF]"
            >
              <div className="relative w-16 h-20 rounded-lg overflow-hidden shrink-0 bg-[#F8F1E7]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h5 className="font-serif text-sm font-semibold text-[#2A3425] truncate">
                  {item.name}
                </h5>
                <p className="text-xs text-stone-500">
                  {item.fabric} • {item.colour}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-[#E6EFE2] text-[#43513B] font-medium px-2 py-0.5 rounded">
                    Qty: {item.quantity}
                  </span>
                  <span className="text-xs text-[#5E7052] font-medium">
                    ✓ Free Fall & Pico Included
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-bold text-[#2A3425]">
                  {formatPrice(item.price * item.quantity)}
                </span>
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="block text-[11px] text-stone-400 line-through">
                    {formatPrice(item.originalPrice * item.quantity)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Boutique Inclusions Banner */}
      <div className="p-4 bg-[#E6EFE2]/70 rounded-2xl border border-[#BDCFB1] flex flex-wrap gap-4 text-xs text-[#43513B]">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#C6A15B]" />
          <span>Pure Silk Mark Certificate Included</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C6A15B]" />
          <span>Boutique Luxury Gift Box Packaging</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#C6A15B]" />
          <span>Transit Insurance Covered</span>
        </div>
      </div>

      {/* Bill Breakdown */}
      <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#E3DCCF] space-y-2 text-xs text-stone-600">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold text-[#2A3425]">{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-[#5E7052]">
            <span>Boutique Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Boutique Shipping</span>
          <span className="font-semibold text-[#2A3425]">
            {shipping === 0 ? 'Complimentary (FREE)' : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between text-stone-400 text-[11px]">
          <span>GST / Taxes</span>
          <span>Included in All Prices</span>
        </div>
        <div className="flex justify-between text-base font-bold text-[#2A3425] pt-2 border-t border-[#E3DCCF]">
          <span>Payable Amount</span>
          <span className="text-[#826530] text-lg font-serif">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 border border-[#BDCFB1] hover:bg-[#E6EFE2] active:scale-95 text-[#2A3425] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-[#5E7052] hover:bg-[#43513B] active:scale-95 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-150 shadow-sm cursor-pointer"
        >
          <span>Proceed to Payment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
