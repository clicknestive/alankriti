'use client';

import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: CategoryItem[];
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedPriceRange: string;
  setSelectedPriceRange: (val: string) => void;
  selectedColour: string;
  setSelectedColour: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}

const PRICE_RANGES = [
  { label: 'All Prices', value: '' },
  { label: 'Under ₹2,000', value: '0-2000' },
  { label: '₹2,000 – ₹2,500', value: '2000-2500' },
  { label: '₹2,500 – ₹3,000', value: '2500-3000' },
  { label: 'Above ₹3,000', value: '3000-999999' },
];

const COLOURS = [
  { name: 'Sage Green', class: 'bg-[#A8B89A]' },
  { name: 'Gold / Cream', class: 'bg-[#C6A15B]' },
  { name: 'Crimson Red', class: 'bg-[#991B1B]' },
  { name: 'Emerald Green', class: 'bg-[#065F46]' },
  { name: 'Peacock Blue', class: 'bg-[#1E40AF]' },
  { name: 'Rani Pink', class: 'bg-[#DB2777]' },
  { name: 'Ivory / White', class: 'bg-[#F8F1E7] border border-stone-300' },
];

export default function ProductFilters({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedPriceRange,
  setSelectedPriceRange,
  selectedColour,
  setSelectedColour,
  sortBy,
  setSortBy,
  resetFilters,
  activeFilterCount,
}: ProductFiltersProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E3DCCF] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#FAF6F0]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#826530]" />
          <h3 className="font-serif text-lg font-bold text-[#2A3425]">Filter Sarees</h3>
          {activeFilterCount > 0 && (
            <span className="bg-[#5E7052] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-[#826530] hover:text-[#5E7052] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-2">
          Sort Curations
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full text-xs py-2 px-3 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
        >
          <option value="featured">Featured Curations</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="newest">Newest Additions</option>
        </select>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-2.5">
          Weave Category
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-between ${
              selectedCategory === ''
                ? 'bg-[#E6EFE2] font-semibold text-[#2A3425]'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span>All Collections</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug)}
              className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-between ${
                selectedCategory === cat.slug
                  ? 'bg-[#E6EFE2] font-semibold text-[#2A3425] border-l-2 border-[#C6A15B]'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-2.5">
          Price Range
        </label>
        <div className="space-y-1.5">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedPriceRange(range.value)}
              className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-between ${
                selectedPriceRange === range.value
                  ? 'bg-[#E6EFE2] font-semibold text-[#2A3425]'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <span>{range.label}</span>
              {selectedPriceRange === range.value && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C6A15B]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Colour Palette */}
      <div>
        <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-2.5">
          Colour Palette
        </label>
        <div className="flex flex-wrap gap-2">
          {COLOURS.map((col) => (
            <button
              key={col.name}
              onClick={() => setSelectedColour(selectedColour === col.name ? '' : col.name)}
              className={`w-6 h-6 rounded-full ${col.class} relative flex items-center justify-center transition-transform ${
                selectedColour === col.name
                  ? 'ring-2 ring-offset-2 ring-[#C6A15B] scale-110'
                  : 'hover:scale-105'
              }`}
              title={col.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
