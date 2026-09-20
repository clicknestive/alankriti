import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import CollectionShowcase from '@/components/home/CollectionShowcase';
import { 
  Sparkles, 
  ArrowRight, 
  Star 
} from 'lucide-react';

export const revalidate = 0; // Dynamic fetch for real-time DB data

async function getHomeData() {
  const [categories, reviews] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
        products: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
        },
      },
    }),
    prisma.review.findMany({
      where: { isApproved: true },
      take: 3,
      orderBy: { rating: 'desc' },
      include: {
        user: { select: { name: true } },
        product: { select: { name: true, slug: true } },
      },
    }),
  ]);

  return { categories, reviews };
}

export default async function HomePage() {
  const { categories, reviews } = await getHomeData();

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* 1. HERO SECTION (CREAM LUXURY) */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-[#F8F1E7] text-[#2A3425] overflow-hidden border-b border-[#E3DCCF]">
        {/* Subtle Luxury Pattern / Silk Texture Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=85"
            alt="Alankriti Couture Sarees"
            fill
            priority
            className="object-cover object-center opacity-15 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F8F1E7]/90 via-[#FAF6F0]/80 to-[#F8F1E7]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8">
          {/* Subtle Logo Emblem */}
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/85 backdrop-blur-md border border-[#C6A15B]/50 shadow-sm animate-fadeIn">
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#C6A15B] bg-white">
              <Image
                src="/images/logo.png"
                alt="Alankriti Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#826530] font-semibold">
              Alankriti Couture Privé
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#2A3425] leading-[1.15]">
              Elegance Woven in <br />
              <span className="text-[#826530] italic font-normal">Every Drape</span>
            </h1>
            <p className="text-base sm:text-xl text-[#5E7052] max-w-2xl mx-auto font-normal leading-relaxed">
              Discover timeless sarees crafted for moments that deserve to be remembered.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-4 bg-[#826530] hover:bg-[#684f23] text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl transition-all duration-300 shadow-md hover:shadow-royal hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>Shop Sarees</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/collections"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-[#FAF6F0] text-[#2A3425] border border-[#BDCFB1] font-semibold text-xs uppercase tracking-[0.2em] rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
            >
              <span>Explore Collection</span>
            </Link>
          </div>

          {/* Supporting Tagline Ribbon */}
          <div className="pt-6 flex items-center justify-center gap-4 text-xs tracking-widest uppercase text-[#826530]">
            <span className="h-[1px] w-12 bg-[#C6A15B]/50" />
            <span className="font-serif italic normal-case text-sm text-[#826530] font-medium">
              "Drapes That Define, Jewellery That Inspires"
            </span>
            <span className="h-[1px] w-12 bg-[#C6A15B]/50" />
          </div>
        </div>
      </section>

      {/* 2. SHOP BY COLLECTION (5 COLLECTIONS, 4 SAREES PER ROW, DETAILS & PRICES 1500-3500) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CollectionShowcase categories={categories as any} />
      </section>

      {/* 3. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-[#826530] font-semibold">
            Patron Testimonials
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A3425]">
            Customer Reviews
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Real stories from our patrons celebrating milestone moments in Alankriti drapes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-2xl border border-[#E3DCCF] shadow-card flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#C6A15B]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= rev.rating ? 'fill-[#C6A15B] text-[#C6A15B]' : 'text-stone-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic font-serif">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-[#2A3425]">{rev.user.name}</h4>
                  <span className="text-[10px] text-[#5E7052] font-medium">Verified Buyer</span>
                </div>
                {rev.product && (
                  <Link
                    href={`/product/${rev.product.slug}`}
                    className="text-[11px] text-[#826530] hover:underline truncate max-w-[140px]"
                  >
                    {rev.product.name}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#826530] hover:text-[#5E7052] transition-colors underline underline-offset-4"
          >
            <span>Read All Verified Drape Stories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 4. CONTACT CONCIERGE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E3DCCF] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs uppercase tracking-[0.25em] text-[#826530] font-semibold">
              Boutique Concierge & Bridal Consultation
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A3425]">
              Planning a Bridal Trousseau or Milestone Celebration?
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
              Schedule a personalized virtual drape consultation or visit our flagship studio in Indiranagar, Bengaluru.
            </p>
          </div>

          <Link
            href="/contact"
            className="shrink-0 px-8 py-4 bg-[#5E7052] hover:bg-[#43513B] text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl transition-all duration-200 shadow-sm"
          >
            Connect With Concierge
          </Link>
        </div>
      </section>
    </div>
  );
}
