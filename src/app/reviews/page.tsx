import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { Star, CheckCircle, Sparkles, MessageSquare, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } },
      product: {
        select: {
          name: true,
          slug: true,
          fabric: true,
          images: { take: 1 },
        },
      },
    },
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Banner */}
      <div className="bg-[#1C241D] text-[#FAF6F0] rounded-3xl p-8 sm:p-14 border border-[#C6A15B]/30 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Patron Impressions
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold">
            Verified Customer Reviews
          </h1>
          <p className="text-xs sm:text-sm text-[#BDCFB1] leading-relaxed">
            Discover real experiences and heartfelt testimonials penned by patrons who have adorned Alankriti Couture drapes across the globe.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-[#BDCFB1]/30 text-center shrink-0 space-y-2">
          <span className="font-serif text-4xl font-bold text-[#E7D3AC] block leading-none">
            {avgRating}
          </span>
          <div className="flex items-center justify-center gap-1 text-[#C6A15B]">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 fill-[#C6A15B]" />
            ))}
          </div>
          <p className="text-xs text-[#BDCFB1]">
            Based on {reviews.length} authenticated reviews
          </p>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-3xl p-6 border border-[#E3DCCF] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#C6A15B] transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
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
                <span className="text-[11px] text-stone-400">{formatDate(rev.createdAt)}</span>
              </div>

              <p className="font-serif text-sm sm:text-base text-stone-800 leading-relaxed italic">
                "{rev.comment}"
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-[#2A3425] flex items-center gap-1">
                    {rev.user.name}
                    <CheckCircle className="w-3.5 h-3.5 text-[#5E7052]" />
                  </h4>
                  <span className="text-[10px] text-stone-400">Verified Boutique Purchaser</span>
                </div>
              </div>

              {rev.product && (
                <Link
                  href={`/product/${rev.product.slug}`}
                  className="flex items-center gap-3 p-2 bg-[#FAF6F0] rounded-xl hover:bg-[#E6EFE2] transition-colors group"
                >
                  <div className="relative w-10 h-12 rounded-lg overflow-hidden shrink-0 bg-stone-200">
                    <Image
                      src={rev.product.images[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'}
                      alt={rev.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#2A3425] group-hover:text-[#826530] truncate">
                      {rev.product.name}
                    </p>
                    <p className="text-[10px] text-stone-500 truncate">{rev.product.fabric}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#826530] shrink-0" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
