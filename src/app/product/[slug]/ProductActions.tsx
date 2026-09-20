'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Heart, Plus, Minus, ArrowRight, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
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
  const [quantity, setQuantity] = useState(1);
  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const router = useRouter();

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    const added = addToCart(product, quantity);
    if (added) {
      setIsCartOpen(true);
    }
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) return;
    addToCart(product, quantity);
    router.push('/checkout');
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Quantity Selector */}
      {product.stock > 0 && (
        <div className="flex items-center gap-4">
          <label className="text-xs font-semibold text-[#2A3425] uppercase tracking-wider">
            Quantity:
          </label>
          <div className="flex items-center border border-[#BDCFB1] rounded-xl bg-white shadow-sm">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-[#E6EFE2] rounded-l-xl transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 text-xs font-bold text-[#2A3425]">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              disabled={quantity >= product.stock}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-[#E6EFE2] rounded-r-xl transition-colors disabled:opacity-30"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[11px] text-stone-400">
            (Max {product.stock} available)
          </span>
        </div>
      )}

      {/* Main Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="w-full py-3.5 px-4 bg-[#E6EFE2] hover:bg-[#A8B89A]/50 text-[#2A3425] rounded-xl text-xs font-bold uppercase tracking-widest border border-[#BDCFB1] flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-40"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add to Bag</span>
        </button>

        <button
          onClick={handleBuyNow}
          disabled={product.stock <= 0}
          className="w-full py-3.5 px-4 bg-[#826530] hover:bg-[#684f23] text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-royal disabled:opacity-40"
        >
          <span>Buy Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Wishlist Button */}
      <button
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
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
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
