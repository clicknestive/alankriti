'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Heart, Plus, Minus, ArrowRight, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number | null;
    image: string;
    fabric: string;
    colour: string;
    category: string;
    stock: number;
  };
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [isBuying, setIsBuying] = useState(false);
  const { items, addToCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/checkout');
    router.prefetch('/login?redirect=/checkout');
  }, [router]);

  const isFavorited = isInWishlist(product.id);
  const cartItem = items.find((i) => i.productId === product.id);
  const cartQty = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addToCart(product, 1);
  };

  const handleBuyNow = () => {
    if (product.stock <= 0 || isBuying) return;
    setIsBuying(true);
    if (cartQty === 0) {
      addToCart(product, 1);
    }
    const target = !user ? '/login?redirect=/checkout' : '/checkout';
    router.push(target);
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Main Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cartQty === 0 ? (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-full py-3.5 px-4 bg-[#E6EFE2] hover:bg-[#5E7052] hover:text-white active:scale-95 text-[#2A3425] rounded-xl text-xs font-bold uppercase tracking-widest border border-[#BDCFB1] flex items-center justify-center gap-2 transition-all duration-150 shadow-sm disabled:opacity-40 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Bag</span>
          </button>
        ) : (
          <div className="w-full py-2 px-3 bg-[#FAF6F0] rounded-xl border border-[#BDCFB1] flex items-center justify-between shadow-sm">
            <span className="text-[11px] font-bold text-[#2A3425] uppercase tracking-wider">In Bag:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity(product.id, cartQty - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-[#BDCFB1] text-[#2A3425] hover:bg-[#826530] hover:text-white transition-colors text-xs font-bold active:scale-90 cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-5 text-center text-xs font-bold text-[#2A3425] select-none">{cartQty}</span>
              <button
                type="button"
                onClick={() => updateQuantity(product.id, cartQty + 1)}
                disabled={cartQty >= product.stock}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-[#BDCFB1] text-[#2A3425] hover:bg-[#826530] hover:text-white transition-colors text-xs font-bold disabled:opacity-40 active:scale-90 cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={product.stock <= 0 || isBuying}
          className="w-full py-3.5 px-4 bg-[#826530] hover:bg-[#684f23] active:scale-95 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-150 shadow-md hover:shadow-royal disabled:opacity-75 cursor-pointer"
        >
          <span>{isBuying ? 'Proceeding...' : 'Buy Now'}</span>
          <ArrowRight className={`w-4 h-4 ${isBuying ? 'animate-pulse' : ''}`} />
        </button>
      </div>

      {/* Wishlist Button */}
      <button
        type="button"
        onClick={() =>
          toggleWishlist({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.image,
            category: product.category,
            fabric: product.fabric,
          })
        }
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all duration-150 active:scale-98 cursor-pointer ${
          isFavorited
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : 'bg-white text-stone-700 border-[#E3DCCF] hover:border-[#C6A15B]'
        }`}
      >
        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-rose-600' : ''}`} />
        <span>{isFavorited ? 'Saved in Your Wishlist' : 'Save to Wishlist'}</span>
      </button>
    </div>
  );
}
