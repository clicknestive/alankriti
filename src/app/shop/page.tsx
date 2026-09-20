'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import ProductFilters from '@/components/product/ProductFilters';
import { Filter, X, ShoppingBag, Sparkles, Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { parseProductImages } from '@/lib/utils';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items: wishlistItems } = useWishlist();

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter States initialized from URL params
  const initialCategory = searchParams.get('category') || '';
  const initialQuery = searchParams.get('q') || '';
  const initialTab = searchParams.get('tab') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedColour, setSelectedColour] = useState('');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState('featured');
  const [isWishlistTab, setIsWishlistTab] = useState(initialTab === 'wishlist');

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSearchQuery(searchParams.get('q') || '');
    setIsWishlistTab(searchParams.get('tab') === 'wishlist');
  }, [searchParams]);

  useEffect(() => {
    if (isWishlistTab) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedPriceRange) params.set('priceRange', selectedPriceRange);
    if (selectedColour) params.set('colour', selectedColour);
    if (searchQuery) params.set('q', searchQuery);
    if (sortBy) params.set('sortBy', sortBy);

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [
    selectedCategory,
    selectedPriceRange,
    selectedColour,
    searchQuery,
    sortBy,
    isWishlistTab,
  ]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedPriceRange('');
    setSelectedColour('');
    setSearchQuery('');
    setSortBy('featured');
    setIsWishlistTab(false);
    router.push('/shop');
  };

  const activeFilterCount = [
    selectedCategory,
    selectedPriceRange,
    selectedColour,
    searchQuery,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-[#1C241D] rounded-3xl p-8 sm:p-12 text-[#FAF6F0] relative overflow-hidden border border-[#C6A15B]/30">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Alankriti Atelier
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold">
            {isWishlistTab ? 'Your Bespoke Wishlist' : 'Boutique Saree Gallery'}
          </h1>
          <p className="text-xs sm:text-sm text-[#BDCFB1] leading-relaxed">
            {isWishlistTab
              ? 'Cherished heirlooms and handwoven drapes curated by you for milestone celebrations.'
              : 'Browse our complete catalog of certified pure Mysore silk, Kanjivaram bridal, Banarasi, and delicate organza sarees.'}
          </p>
        </div>

        {/* Wishlist toggle tab */}
        <div className="mt-6 flex flex-wrap gap-2 relative z-10">
          <button
            onClick={() => {
              setIsWishlistTab(false);
              router.push('/shop');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              !isWishlistTab
                ? 'bg-[#C6A15B] text-[#1C241D]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            All Sarees
          </button>
          <button
            onClick={() => {
              setIsWishlistTab(true);
              router.push('/shop?tab=wishlist');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              isWishlistTab
                ? 'bg-[#C6A15B] text-[#1C241D]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Wishlist ({wishlistItems.length})</span>
          </button>
        </div>
      </div>

      {/* Main Grid & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        {!isWishlistTab && (
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28">
              <ProductFilters
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedPriceRange={selectedPriceRange}
                setSelectedPriceRange={setSelectedPriceRange}
                selectedColour={selectedColour}
                setSelectedColour={setSelectedColour}
                sortBy={sortBy}
                setSortBy={setSortBy}
                resetFilters={resetFilters}
                activeFilterCount={activeFilterCount}
              />
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <div className={`${isWishlistTab ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-6`}>
          {/* Top Bar on Mobile and Active Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E3DCCF]">
            <div className="text-xs text-stone-600 font-medium">
              {isWishlistTab ? (
                <span>Showing {wishlistItems.length} saved sarees</span>
              ) : (
                <span>
                  Showing <strong className="text-[#2A3425]">{products.length}</strong> curated sarees
                  {searchQuery && ` for "${searchQuery}"`}
                </span>
              )}
            </div>

            {/* Mobile Filter Toggle */}
            {!isWishlistTab && (
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-xs font-semibold text-[#2A3425]"
              >
                <Filter className="w-4 h-4 text-[#826530]" />
                <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
              </button>
            )}
          </div>

          {/* Active Filter Pills */}
          {!isWishlistTab && activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Active filters:</span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#E6EFE2] text-[#43513B] px-3 py-1 rounded-full">
                  Category: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                  <button onClick={() => setSelectedCategory('')}>
                    <X className="w-3 h-3 hover:text-stone-900" />
                  </button>
                </span>
              )}
              {selectedColour && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#E6EFE2] text-[#43513B] px-3 py-1 rounded-full">
                  Colour: {selectedColour}
                  <button onClick={() => setSelectedColour('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#FAF6EE] text-[#826530] border border-[#DBBD83] px-3 py-1 rounded-full">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-xs text-rose-700 hover:underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Loading or Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl h-96 animate-pulse border border-[#E3DCCF]"
                />
              ))}
            </div>
          ) : isWishlistTab ? (
            wishlistItems.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E3DCCF] space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF6F0] flex items-center justify-center mx-auto text-[#C6A15B]">
                  <Heart className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="font-serif text-2xl text-[#2A3425]">Your Wishlist is Empty</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Click the heart icon on any saree to save it for your bridal trousseau or upcoming festive celebrations.
                </p>
                <button
                  onClick={() => setIsWishlistTab(false)}
                  className="px-6 py-2.5 bg-[#5E7052] text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#43513B]"
                >
                  Explore Sarees
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlistItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    slug={item.slug}
                    categoryName={item.category}
                    price={item.price}
                    originalPrice={item.originalPrice}
                    imageUrl={item.image}
                    fabric={item.fabric}
                    colour="Curated"
                    stock={10}
                  />
                ))}
              </div>
            )
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E3DCCF] space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF6F0] flex items-center justify-center mx-auto text-[#826530]">
                <ShoppingBag className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="font-serif text-2xl text-[#2A3425]">No Matching Sarees Found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try loosening your filter parameters or search term to discover our complete handloom range.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-[#5E7052] text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#43513B]"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  categoryName={product.category?.name || 'Handloom'}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  discount={product.discount}
                  imageUrl={
                    parseProductImages(product.images)[0] ||
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
                  }
                  fabric={product.fabric}
                  colour={product.colour}
                  stock={product.stock}
                  isFeatured={product.isFeatured}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Slide-over */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h3 className="font-serif text-xl font-bold text-[#2A3425]">Filter Sarees</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 text-stone-500 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4">
              <ProductFilters
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={(val) => {
                  setSelectedCategory(val);
                  setIsMobileFilterOpen(false);
                }}
                selectedPriceRange={selectedPriceRange}
                setSelectedPriceRange={(val) => {
                  setSelectedPriceRange(val);
                  setIsMobileFilterOpen(false);
                }}
                selectedColour={selectedColour}
                setSelectedColour={(val) => {
                  setSelectedColour(val);
                  setIsMobileFilterOpen(false);
                }}
                sortBy={sortBy}
                setSortBy={setSortBy}
                resetFilters={() => {
                  resetFilters();
                  setIsMobileFilterOpen(false);
                }}
                activeFilterCount={activeFilterCount}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#C6A15B] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
