'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Eye, Sparkles, Minus, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  price: number;
  originalPrice?: number | null;
  discount?: number;
  imageUrl: string;
  fabric: string;
  colour: string;
  stock: number;
  isFeatured?: boolean;
}

export default function ProductCard({
  id,
  name,
  slug,
  categoryName,
  price,
  originalPrice,
  discount,
  imageUrl,
  fabric,
  colour,
  stock,
  isFeatured,
}: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { items, addToCart, updateQuantity } = useCart();

  const isFavorited = isInWishlist(id);
  const cartItem = items.find((item) => item.productId === id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-[#E3DCCF] hover:border-[#C6A15B] transition-all duration-300 hover:shadow-royal flex flex-col">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {discount && discount > 0 ? (
          <span className="bg-[#5E7052] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm tracking-wide">
            {discount}% OFF
          </span>
        ) : null}
        {isFeatured && (
          <span className="bg-[#C6A15B] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm tracking-widest uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Heirloom
          </span>
        )}
        {stock <= 3 && stock > 0 && (
          <span className="bg-rose-700 text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm">
            Only {stock} left
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist({
            id,
            name,
            slug,
            price,
            originalPrice,
            image: imageUrl,
            category: categoryName,
            fabric,
          });
        }}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
          isFavorited
            ? 'bg-rose-50 text-rose-600 shadow-md scale-110'
            : 'bg-white/80 text-stone-600 hover:text-rose-600 hover:bg-white shadow-sm'
        }`}
        aria-label={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
      </button>

      {/* Image Container with Link */}
      <Link href={`/product/${slug}`} className="relative block aspect-[3/4] w-full overflow-hidden bg-[#F8F1E7]">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Quick View Hover Bar */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-white font-medium bg-[#1C241D]/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/20">
            <Eye className="w-3.5 h-3.5 text-[#C6A15B]" /> View Details
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#826530] font-medium uppercase tracking-wider mb-1">
            <span className="truncate max-w-[90px]">{categoryName}</span>
            <span className="text-stone-400 normal-case truncate max-w-[70px]">{colour}</span>
          </div>

          <Link href={`/product/${slug}`}>
            <h3 className="font-serif text-xs sm:text-base font-semibold text-[#2A3425] hover:text-[#826530] transition-colors line-clamp-2 leading-snug">
              {name}
            </h3>
          </Link>

          <p className="text-[11px] sm:text-xs text-stone-500 mt-1 line-clamp-1">
            {fabric}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-3 pt-2.5 border-t border-[#FAF6F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-[#2A3425]">
                {formatPrice(price)}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            <p className="text-[9px] sm:text-[10px] text-[#5E7052] font-medium">Free Bespoke Stitching</p>
          </div>

          {quantity === 0 ? (
            <button
              type="button"
              onClick={() =>
                addToCart({
                  id,
                  name,
                  slug,
                  price,
                  originalPrice,
                  image: imageUrl,
                  fabric,
                  colour,
                  stock,
                })
              }
              className="w-full sm:w-auto px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-[#E6EFE2] hover:bg-[#5E7052] text-[#2A3425] hover:text-white transition-all text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 cursor-pointer"
              title="Add to Shopping Bag"
              aria-label="Add to Shopping Bag"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>Add to Bag</span>
            </button>
          ) : (
            <div className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-[#BDCFB1] bg-[#FAF6F0] p-1 shadow-sm gap-1">
              <button
                type="button"
                onClick={() => updateQuantity(id, quantity - 1)}
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-white text-[#2A3425] hover:bg-[#826530] hover:text-white transition-colors text-xs font-bold active:scale-90 cursor-pointer"
                aria-label="Decrease quantity"
                title="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-5 text-center text-xs font-bold text-[#2A3425] select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(id, quantity + 1)}
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-white text-[#2A3425] hover:bg-[#826530] hover:text-white transition-colors text-xs font-bold disabled:opacity-40 active:scale-90 cursor-pointer"
                disabled={quantity >= stock}
                aria-label="Increase quantity"
                title="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
