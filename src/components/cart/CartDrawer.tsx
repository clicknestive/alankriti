'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    itemCount,
    subtotal,
    discount,
    shipping,
    total,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
  } = useCart();

  if (pathname?.startsWith('/admin') || !isCartOpen) return null;

  const freeShippingThreshold = 5000;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 flex animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-md bg-[#FAF6F0] h-full shadow-2xl flex flex-col z-10 border-l border-[#C6A15B]/40">
        {/* Header */}
        <div className="p-5 border-b border-[#E3DCCF] flex items-center justify-between bg-[#F8F1E7]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#826530]" />
            <h3 className="font-serif text-xl font-bold text-[#2A3425]">Bespoke Shopping Bag</h3>
            <span className="text-xs bg-[#A8B89A]/30 text-[#2A3425] font-semibold px-2 py-0.5 rounded-full">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-stone-400 hover:text-stone-800 rounded-full"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-[#E6EFE2] p-3.5 border-b border-[#BDCFB1]/60 text-xs">
          {amountNeededForFreeShipping > 0 ? (
            <div>
              <p className="text-[#43513B] font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
                Add <span className="font-bold text-[#2A3425]">{formatPrice(amountNeededForFreeShipping)}</span> more for <strong>Complimentary Express Shipping</strong>!
              </p>
              <div className="w-full bg-[#BDCFB1] h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#5E7052] h-full rounded-full transition-all duration-300"
                  style={{ width: `${freeShippingPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-[#2A3425] font-semibold flex items-center gap-1.5">
              ✨ You qualify for Complimentary Express Boutique Shipping!
            </p>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E6EFE2] flex items-center justify-center text-[#5E7052]">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <h4 className="font-serif text-xl text-[#2A3425]">Your Bag is Empty</h4>
              <p className="text-xs text-stone-500 max-w-xs">
                Explore our handcrafted Mysore, Kanjivaram, and Banarasi silk collections to begin your bespoke curation.
              </p>
              <Link
                href="/shop"
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-6 py-2.5 bg-[#5E7052] hover:bg-[#43513B] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
              >
                Explore Sarees
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 p-3 bg-white rounded-xl border border-[#E3DCCF] shadow-sm relative group"
              >
                {/* Thumbnail */}
                <div className="relative w-20 h-24 rounded-lg overflow-hidden shrink-0 bg-[#F8F1E7]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={() => setIsCartOpen(false)}
                        className="font-serif text-sm font-semibold text-[#2A3425] hover:text-[#826530] line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">{item.fabric} • {item.colour}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                    <div className="flex items-center border border-[#BDCFB1] rounded-lg bg-[#FAF6F0]">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-[#E6EFE2] rounded-l text-[#2A3425]"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold text-[#2A3425]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-1 hover:bg-[#E6EFE2] rounded-r text-[#2A3425] disabled:opacity-40 disabled:hover:bg-transparent"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-[#2A3425]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="block text-[10px] text-stone-400 line-through">
                          {formatPrice(item.originalPrice * item.quantity)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Action */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#E3DCCF] bg-[#F8F1E7] space-y-3">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#2A3425]">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#5E7052]">
                  <span>Boutique Savings</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-[#2A3425]">
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#2A3425] pt-2 border-t border-[#E3DCCF]">
                <span>Total Amount</span>
                <span className="text-base text-[#826530]">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href="/cart"
                onClick={() => setIsCartOpen(false)}
                className="py-2.5 text-center border border-[#BDCFB1] hover:bg-[#E6EFE2] text-[#2A3425] rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                View Full Bag
              </Link>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  if (!user) {
                    router.push('/login?redirect=/checkout');
                  } else {
                    router.push('/checkout');
                  }
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-[#5E7052] hover:bg-[#43513B] text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors shadow-sm"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
