import React from 'react';
import { Truck, Sparkles, ShieldCheck, Clock } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-[#E3DCCF] pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-[#826530] font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Express Concierge Delivery
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A3425] mt-1">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs text-stone-500 mt-1">Insured Pan-India & Worldwide Boutique Transit</p>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E3DCCF] shadow-sm space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-stone-100 text-center">
          <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#E3DCCF]">
            <Truck className="w-6 h-6 text-[#C6A15B] mx-auto mb-1" />
            <h4 className="font-serif font-bold text-[#2A3425]">Domestic Express</h4>
            <p className="text-xs text-stone-500 mt-1">2 – 5 Business Days across India</p>
          </div>
          <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#E3DCCF]">
            <Clock className="w-6 h-6 text-[#C6A15B] mx-auto mb-1" />
            <h4 className="font-serif font-bold text-[#2A3425]">International Air</h4>
            <p className="text-xs text-stone-500 mt-1">5 – 9 Business Days Worldwide</p>
          </div>
          <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#E3DCCF]">
            <ShieldCheck className="w-6 h-6 text-[#C6A15B] mx-auto mb-1" />
            <h4 className="font-serif font-bold text-[#2A3425]">Insured Transit</h4>
            <p className="text-xs text-stone-500 mt-1">100% Comprehensive Coverage</p>
          </div>
        </div>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#2A3425]">1. Complimentary Bespoke Stitching Time</h2>
          <p>
            All sarees undergo complimentary quality inspection, Silk Mark tagging, and hand-rolled fall & pico stitching prior to dispatch. This tailored care requires <strong>24 to 48 hours</strong> before being handed over to express couriers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#2A3425]">2. Domestic Shipping Rates & Thresholds</h2>
          <p>
            We offer <strong>Complimentary Express Shipping</strong> on all domestic orders above <strong>₹5,000</strong>. For orders below this amount, a standard flat fee of ₹250 is applied at checkout.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#2A3425]">3. Luxury Gift Packaging</h2>
          <p>
            Every order is dispatched in our signature rigid gold-foiled Alankriti Couture box, wrapped in protective muslin cloth to shield pure zari threads from moisture and friction during transit.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#2A3425]">4. Live Real-Time Tracking</h2>
          <p>
            Once dispatched from our Indiranagar boutique studio, you will receive an SMS and email notification with an express AWB tracking number. You can also view the live order timeline under <strong className="text-[#826530]">My Orders</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
