import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { Sparkles, ArrowRight } from 'lucide-react';

export const revalidate = 0;

export default async function CollectionsPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-[#826530] font-semibold flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
          Artisanal Weaving Clusters
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#2A3425]">
          Curated Heritage Collections
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          From ancient royal looms to modern haute couture interpretations, explore our 5 signature saree collections woven by master guilds.
        </p>
      </div>

      {/* Collections Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className="group bg-white rounded-3xl overflow-hidden border border-[#E3DCCF] hover:border-[#C6A15B] transition-all duration-300 shadow-sm hover:shadow-royal flex flex-col"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#F8F1E7]">
              <Image
                src={cat.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="bg-[#2A3425]/90 backdrop-blur-md text-[#E7D3AC] text-[10px] font-bold px-3 py-1 rounded-full border border-[#C6A15B]/40 uppercase tracking-widest">
                  Collection #{idx + 1}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="font-serif text-2xl font-bold text-white leading-snug drop-shadow-sm">
                  {cat.name}
                </h2>
                <span className="text-xs text-[#E7D3AC] uppercase tracking-wider block mt-1">
                  {cat._count?.products || 0} Exclusive Sarees
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                {cat.description || 'Authentic pure handloom silk saree handcrafted by master artisans with traditional motifs and tested gold zari borders.'}
              </p>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5E7052]">
                  100% Silk Mark Certified
                </span>
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5E7052] hover:bg-[#43513B] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
