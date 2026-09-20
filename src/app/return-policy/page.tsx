import React from 'react';
import { RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-[#E3DCCF] pb-6">
        <span className="text-xs uppercase tracking-[0.2em] text-[#826530] font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Patron Satisfaction Guarantee
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A3425] mt-1">
          Return & Exchange Policy
        </h1>
        <p className="text-xs text-stone-500 mt-1">7-Day Boutique Return and Exchange Assurance</p>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E3DCCF] shadow-sm space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#2A3425]">1. 7-Day Exchange Window</h2>
          <p>
            If you are not completely enchanted by your Alankriti saree, you may request an exchange or boutique credit within <strong>7 days</strong> of delivery.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#2A3425]">2. Condition Requirements</h2>
          <p>
            To ensure the sanctity of handloom creations for all patrons, the saree must remain unworn, unaltered, with original Silk Mark certification tags intact, and in its signature luxury presentation box.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#2A3425]">3. Return Pickup & Concierge Assistance</h2>
          <p>
            Our concierge will arrange an insured doorstep reverse pickup. Upon arrival and artisanal verification at our studio, your exchange or refund will be initiated within <strong>48 hours</strong> to the original payment method.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#2A3425]">4. How to Initiate a Return</h2>
          <p>
            Visit <strong className="text-[#826530]">My Orders</strong> or contact concierge via email at <strong>concierge@alankriticouture.com</strong> or WhatsApp at <strong>+91 98765 43210</strong> with your Order ID (e.g. ALC-2026-XXXXXX).
          </p>
        </section>
      </div>
    </div>
  );
}
