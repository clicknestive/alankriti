'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, Heart, ShoppingBag, Eye, CheckCircle2, Minus, Plus } from 'lucide-react';
import { formatPrice, parseProductImages } from '@/lib/utils';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

export interface SareeItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  discount?: number;
  stock: number;
  fabric: string;
  colour: string;
  occasion: string;
  sareeLength: string;
  blouseDetails: string;
  description?: string;
  isFeatured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: {
    url: string;
    alt?: string | null;
  }[];
}

export interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  _count?: {
    products: number;
  };
  products: SareeItem[];
}

interface CollectionShowcaseProps {
  categories: CollectionItem[];
}

export default function CollectionShowcase({ categories }: CollectionShowcaseProps) {
  const [activeSlug, setActiveSlug] = useState<string>('all');
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { items, addToCart, updateQuantity } = useCart();

  const allProducts: SareeItem[] = categories
    .flatMap((cat) =>
      cat.products.map((p) => ({ ...p, category: { id: cat.id, name: cat.name, slug: cat.slug } }))
    )
    .sort((a, b) => a.price - b.price);

  const displayedProducts: SareeItem[] =
    activeSlug === 'all'
      ? allProducts
      : (categories.find((c) => c.slug === activeSlug)?.products || [])
          .map((p) => ({
            ...p,
            category: {
              id: categories.find((c) => c.slug === activeSlug)!.id,
              name: categories.find((c) => c.slug === activeSlug)!.name,
              slug: activeSlug,
            },
          }))
          .sort((a, b) => a.price - b.price);

  const activeCategory = categories.find((c) => c.slug === activeSlug);

  return (
    <div className="space-y-8">
      {/* Header & Description */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#826530] font-semibold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
            Handloom Masterpieces
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A3425] mt-1">
            Shop by Collection
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Explore our 5 signature collections: Pure Silk, Semi Crepe, Organza, Cotton Handloom &amp; Georgette.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF6F0] border border-[#BDCFB1] text-xs font-semibold text-[#5E7052]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#826530]" />
            5 Collections • 25 Curations
          </span>
        </div>
      </div>

      {/* Collection Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveSlug('all')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
            activeSlug === 'all'
              ? 'bg-[#826530] text-white shadow-sm'
              : 'bg-white text-[#2A3425] border border-[#E3DCCF] hover:border-[#826530] hover:text-[#826530]'
          }`}
        >
          All Collections ({allProducts.length})
        </button>

        {categories.map((cat) => {
          const isActive = activeSlug === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveSlug(cat.slug)}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'bg-[#826530] text-white shadow-sm'
                  : 'bg-white text-[#2A3425] border border-[#E3DCCF] hover:border-[#826530] hover:text-[#826530]'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/25 text-white' : 'bg-[#FAF6F0] text-stone-600'
                }`}
              >
                {cat.products.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Collection Info Banner */}
      {activeCategory && (
        <div className="bg-[#FAF6F0] border border-[#E3DCCF] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2A3425]">{activeCategory.name} Collection</h3>
            <p className="text-xs text-stone-600 mt-0.5">
              {activeCategory.description} • Prices starting from{' '}
              <span className="font-bold text-[#826530]">
                {formatPrice(Math.min(...activeCategory.products.map((p) => p.price)))}
              </span>{' '}
              to{' '}
              <span className="font-bold text-[#826530]">
                {formatPrice(Math.max(...activeCategory.products.map((p) => p.price)))}
              </span>
            </p>
          </div>
          <Link
            href={`/shop?category=${activeCategory.slug}`}
            className="text-xs font-bold uppercase tracking-wider text-[#826530] hover:text-[#5E7052] flex items-center gap-1 transition-colors shrink-0"
          >
            <span>View In Shop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 4 Sarees in One Row Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
        {displayedProducts.map((product) => {
          const isFavorited = isInWishlist(product.id);
          const parsedImgs = parseProductImages(product.images);
          const firstImage =
            parsedImgs[0] ||
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

          return (
            <div
              key={product.id}
              className="group relative bg-white rounded-2xl overflow-hidden border border-[#E3DCCF] hover:border-[#C6A15B] transition-all duration-300 hover:shadow-royal flex flex-col"
            >
              {/* Top Badges */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
                <span className="bg-[#826530] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm tracking-wider uppercase">
                  {product.category.name}
                </span>
                {product.isFeatured && (
                  <span className="bg-[#5E7052] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm tracking-widest uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Heirloom
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist({
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    image: firstImage,
                    category: product.category.name,
                    fabric: product.fabric,
                  });
                }}
                className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
                  isFavorited
                    ? 'bg-rose-50 text-rose-600 shadow-md scale-110'
                    : 'bg-white/85 text-stone-600 hover:text-rose-600 hover:bg-white shadow-sm'
                }`}
                aria-label={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>

              {/* Image Container */}
              <Link
                href={`/product/${product.slug}`}
                className="relative block aspect-[3/4] w-full overflow-hidden bg-[#F8F1E7]"
              >
                <Image
                  src={firstImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Quick View Hover Bar */}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-white font-medium bg-[#1C241D]/85 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/20">
                    <Eye className="w-3.5 h-3.5 text-[#C6A15B]" /> View Details
                  </span>
                </div>
              </Link>

              {/* Saree Details & Specifications */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  {/* Category & Colour Info */}
                  <div className="flex items-center justify-between text-[11px] text-[#826530] font-medium tracking-wide mb-1">
                    <span className="uppercase font-semibold">{product.fabric}</span>
                    <span className="text-stone-500 font-normal">{product.colour}</span>
                  </div>

                  {/* Saree Name */}
                  <Link href={`/product/${product.slug}`}>
                    <h4 className="font-serif text-base font-bold text-[#2A3425] hover:text-[#826530] transition-colors line-clamp-1 leading-snug">
                      {product.name}
                    </h4>
                  </Link>

                  {/* Product Description */}
                  {product.description && (
                    <p className="mt-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500 leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Price & Add to Cart */}
                <div className="mt-auto pt-3 border-t border-[#FAF6F0] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-lg font-bold text-[#2A3425]">
                      {formatPrice(product.price)}
                    </span>
                    <p className="text-[10px] text-[#5E7052] font-semibold tracking-wide">
                      Inclusive of all taxes
                    </p>
                  </div>

                  {(() => {
                    const cartItem = items.find((i) => i.productId === product.id);
                    const quantity = cartItem ? cartItem.quantity : 0;

                    if (quantity === 0) {
                      return (
                        <button
                          type="button"
                          onClick={() =>
                            addToCart({
                              id: product.id,
                              name: product.name,
                              slug: product.slug,
                              price: product.price,
                              image: firstImage,
                              fabric: product.fabric,
                              colour: product.colour,
                              stock: product.stock,
                            })
                          }
                          className="px-3 py-2 rounded-xl bg-[#FAF6F0] hover:bg-[#826530] text-[#2A3425] hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                          title="Add to Shopping Bag"
                          aria-label="Add to Shopping Bag"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Bag</span>
                        </button>
                      );
                    }

                    return (
                      <div className="inline-flex items-center rounded-xl border border-[#BDCFB1] bg-[#FAF6F0] p-1 shadow-sm gap-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-[#2A3425] hover:bg-[#826530] hover:text-white transition-colors text-xs font-bold active:scale-90 cursor-pointer"
                          aria-label="Decrease quantity"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-[#2A3425] select-none">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-[#2A3425] hover:bg-[#826530] hover:text-white transition-colors text-xs font-bold disabled:opacity-40 active:scale-90 cursor-pointer"
                          disabled={quantity >= product.stock}
                          aria-label="Increase quantity"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="pt-4 text-center">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#826530] hover:bg-[#684f23] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-sm hover:shadow-royal"
        >
          <span>Explore All 25 Curations in Shop</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
