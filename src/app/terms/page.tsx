import React from 'react';
import { Sparkles } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-[#E3DCCF] pb-6">
        <span className="text-xs uppercase tracking-[0.2em] text-[#826530] font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Terms & Conditions
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A3425] mt-1">
          Boutique Terms of Service
        </h1>
        <p className="text-xs text-stone-500 mt-1">Last Updated: September 2026</p>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E3DCCF] shadow-sm space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#2A3425]">1. Handloom Artisanal Authenticity</h2>
          <p>
            Because our sarees are woven by hand on traditional looms using pure natural silks and zari, subtle variations in weave texture, yarn slubs, and motifs are inherent hallmarks of artisanal handcrafting rather than defects.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#2A3425]">2. Product Photography & Colour Fidelity</h2>
          <p>
            We photograph all drapes in natural and studio lighting to represent genuine silk sheen. However, slight variations may appear depending on your screen display calibration.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#2A3425]">3. Pricing, Orders & Dispatch</h2>
          <p>
            All prices listed on Alankriti Couture are inclusive of applicable taxes. In the rare event an item is out of stock due to simultaneous boutique showroom orders, we will notify you immediately for an exchange or full prompt refund.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#2A3425]">4. Intellectual Property</h2>
          <p>
            All designs, motifs, brand logos, imagery, and text on this boutique platform are the exclusive intellectual property of <strong>ALANKRITI COUTURE</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
