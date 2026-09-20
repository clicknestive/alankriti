'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Award,
  Tag
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    shipping,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'ALANKRITI10') {
      const disc = Math.round(subtotal * 0.1);
      setCouponDiscount(disc);
      setAppliedCoupon('ALANKRITI10 (10% Boutique Privé Privilege)');
      showToast('10% Boutique Privé discount applied!', 'success');
      setCouponCode('');
    } else if (code === 'ROYALSILK') {
      const disc = 2000;
      setCouponDiscount(disc);
      setAppliedCoupon('ROYALSILK (₹2,000 Bridal Privilege)');
      showToast('₹2,000 Bridal Privilege coupon applied!', 'success');
      setCouponCode('');
    } else {
      showToast('Invalid promo code. Try "ALANKRITI10" for 10% privilege.', 'error');
    }
  };

  const finalPayable = Math.max(0, total - couponDiscount);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#E6EFE2] text-[#5E7052] flex items-center justify-center mx-auto border border-[#BDCFB1]">
          <ShoppingBag className="w-10 h-10 opacity-70" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A3425]">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
          Begin your journey into authentic Indian handloom silk sarees. Explore our curated bridal, festival, and everyday luxury collections.
        </p>
        <div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#5E7052] hover:bg-[#43513B] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
          >
            <span>Explore Handcrafted Sarees</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DCCF] pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#826530] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Bag
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A3425]">
            Bespoke Shopping Bag ({itemCount} {itemCount === 1 ? 'Saree' : 'Sarees'})
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-700 hover:underline self-start sm:self-auto"
        >
          Clear Entire Bag
        </button>
      </div>

      {/* Grid Layout: Items List on Left, Price Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left 8 Cols: Item Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#E3DCCF] shadow-sm space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 border-b last:border-b-0 border-stone-100"
              >
                {/* Thumbnail */}
                <Link
                  href={`/product/${item.slug}`}
                  className="relative w-20 h-28 sm:w-24 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-[#F8F1E7]"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-serif text-base font-bold text-[#2A3425] hover:text-[#826530] transition-colors line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-stone-500">
                    {item.fabric} • Shade: {item.colour}
                  </p>
                  <div className="pt-1 flex items-center gap-3 text-xs text-[#5E7052]">
                    <span>✓ Complimentary Fall & Pico</span>
                    <span>•</span>
                    <span>Silk Mark Tagged</span>
                  </div>
                </div>

                {/* Quantity Controls with Stock Limit Check */}
                <div className="flex sm:flex-col items-center gap-2">
                  <div className="flex items-center border border-[#BDCFB1] rounded-xl bg-[#FAF6F0]">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 hover:bg-[#E6EFE2] rounded-l-xl text-[#2A3425]"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-[#2A3425]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="p-1.5 hover:bg-[#E6EFE2] rounded-r-xl text-[#2A3425] disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {item.quantity >= item.stock && (
                    <span className="text-[10px] text-amber-700 font-medium">Max stock limit</span>
                  )}
                </div>

                {/* Price & Delete */}
                <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <div>
                    <span className="text-base font-bold text-[#2A3425] block">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-xs text-stone-400 line-through block">
                        {formatPrice(item.originalPrice * item.quantity)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#826530] hover:text-[#5E7052] uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Browsing Sarees</span>
            </Link>
          </div>
        </div>

        {/* Right 4 Cols: Order Breakdown & Checkout */}
        <div className="lg:col-span-4 space-y-6">
          {/* Promo Code Box */}
          <div className="bg-white rounded-3xl p-6 border border-[#E3DCCF] shadow-sm space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#2A3425] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#826530]" /> Boutique Privé Coupon
            </h4>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="e.g. ALANKRITI10"
                className="flex-1 px-3 py-2 text-xs bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-[#2A3425] uppercase tracking-wider focus:outline-none focus:border-[#C6A15B]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#5E7052] hover:bg-[#43513B] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
              >
                Apply
              </button>
            </form>
            {appliedCoupon && (
              <p className="text-xs text-[#5E7052] font-semibold">
                ✓ Applied: {appliedCoupon}
              </p>
            )}
            <p className="text-[11px] text-stone-400">
              Try coupon code: <strong className="text-[#826530]">ALANKRITI10</strong> for 10% off
            </p>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-[#E3DCCF] shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#2A3425] border-b border-stone-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold text-[#2A3425]">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[#5E7052]">
                  <span>Catalog Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-[#5E7052]">
                  <span>Privé Privilege Coupon</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Boutique Shipping</span>
                <span className="font-semibold text-[#2A3425]">
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>

              <div className="flex justify-between text-stone-400 text-[11px]">
                <span>GST & Transit Insurance</span>
                <span>Included</span>
              </div>

              <div className="flex justify-between text-base font-bold text-[#2A3425] pt-3 border-t border-stone-200">
                <span>Final Payable</span>
                <span className="text-[#826530] text-xl font-serif">{formatPrice(finalPayable)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 bg-[#826530] hover:bg-[#684f23] text-white rounded-xl text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-royal"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-stone-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5E7052]" /> 100% Secure
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#C6A15B]" /> Silk Mark
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
