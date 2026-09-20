import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Award, ShieldCheck, Scissors, Heart, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Banner */}
      <div className="bg-[#1C241D] rounded-3xl p-8 sm:p-16 text-[#FAF6F0] relative overflow-hidden border border-[#C6A15B]/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF6F0]/10 border border-[#C6A15B]/40 text-xs text-[#E7D3AC] uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
            Artisanal Odyssey
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold leading-tight">
            "Drapes That Define, <br />
            <span className="italic gold-gradient-text font-normal">Jewellery That Inspires"</span>
          </h1>
          <p className="text-xs sm:text-base text-[#BDCFB1] leading-relaxed max-w-2xl font-light">
            Alankriti Couture was founded on the philosophy that a handwoven saree is not simply attire—it is living poetry, an eternal dialogue between master weavers, pure mulberry silk, and tested gold zari.
          </p>
        </div>
      </div>

      {/* Philosophy & Craft */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-5 text-stone-700 text-xs sm:text-sm leading-relaxed">
          <span className="text-xs uppercase tracking-[0.2em] text-[#826530] font-semibold block">
            Our Heritage Story
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#2A3425] leading-snug">
            Honouring Ancient Looms Across Indian Weaving Capitals
          </h2>
          <p>
            From the sacred ghats of Varanasi to the temple town of Kanchipuram and the royal palaces of Mysore, our curators travel to ancestral weaving clusters to commission limited-edition drapes.
          </p>
          <p>
            We eliminate middlemen, ensuring that generational artisan families receive the honorarium and creative freedom they deserve while delivering uncompromised authenticity to our global patrons.
          </p>
          <div className="pt-2 flex items-center gap-6">
            <div>
              <span className="font-serif text-3xl font-bold text-[#826530] block">100%</span>
              <span className="text-xs text-stone-500">Pure Silk Mark Certified</span>
            </div>
            <div className="border-l border-stone-200 pl-6">
              <span className="font-serif text-3xl font-bold text-[#826530] block">10+</span>
              <span className="text-xs text-stone-500">Weave Heritage Clusters</span>
            </div>
            <div className="border-l border-stone-200 pl-6">
              <span className="font-serif text-3xl font-bold text-[#826530] block">45 Days</span>
              <span className="text-xs text-stone-500">Average Loom Weaving Time</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#E3DCCF]">
            <Image
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
              alt="Mysore Silk Weave"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#E3DCCF] mt-8">
            <Image
              src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"
              alt="Kanjivaram Silk Motif"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Signature Values */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E3DCCF] shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-[0.2em] text-[#826530] font-semibold">
            Boutique Pillars
          </span>
          <h3 className="font-serif text-3xl font-bold text-[#2A3425]">
            The Four Pillars of Alankriti
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 bg-[#FAF6F0] rounded-2xl border border-[#E3DCCF] space-y-2 text-center">
            <Award className="w-8 h-8 text-[#C6A15B] mx-auto mb-2" />
            <h4 className="font-serif text-base font-bold text-[#2A3425]">Purity of Silk</h4>
            <p className="text-xs text-stone-600">Strictly 100% natural mulberry and kora silk fibers without synthetic blends.</p>
          </div>

          <div className="p-5 bg-[#FAF6F0] rounded-2xl border border-[#E3DCCF] space-y-2 text-center">
            <ShieldCheck className="w-8 h-8 text-[#C6A15B] mx-auto mb-2" />
            <h4 className="font-serif text-base font-bold text-[#2A3425]">Tested Zari</h4>
            <p className="text-xs text-stone-600">Pure silver and gold electroplated zari threads that maintain heirloom brilliance.</p>
          </div>

          <div className="p-5 bg-[#FAF6F0] rounded-2xl border border-[#E3DCCF] space-y-2 text-center">
            <Scissors className="w-8 h-8 text-[#C6A15B] mx-auto mb-2" />
            <h4 className="font-serif text-base font-bold text-[#2A3425]">Bespoke Tailoring</h4>
            <p className="text-xs text-stone-600">Complimentary hand-rolled fall, pico finishing, and custom blouse tailoring.</p>
          </div>

          <div className="p-5 bg-[#FAF6F0] rounded-2xl border border-[#E3DCCF] space-y-2 text-center">
            <Heart className="w-8 h-8 text-[#C6A15B] mx-auto mb-2" />
            <h4 className="font-serif text-base font-bold text-[#2A3425]">Patron Privé Care</h4>
            <p className="text-xs text-stone-600">Personalized video draping consultations and insured global delivery.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#5E7052] hover:bg-[#43513B] text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-sm"
        >
          <span>Explore The Curations</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
