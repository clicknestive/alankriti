import React from 'react';
import { ShieldCheck, Lock, Sparkles } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-[#E3DCCF] pb-6">
        <span className="text-xs uppercase tracking-[0.2em] text-[#826530] font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Patron Trust
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A3425] mt-1">
          Privacy Policy
        </h1>
        <p className="text-xs text-stone-500 mt-1">Last Updated: September 2026</p>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E3DCCF] shadow-sm space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#2A3425]">1. Commitment to Patron Privacy</h2>
          <p>
            At <strong>ALANKRITI COUTURE</strong>, we are committed to safeguarding the confidentiality and integrity of your personal information. We treat your personal details with the utmost care, ensuring all transactions are securely encrypted and processed.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#2A3425]">2. Information We Collect</h2>
          <p>
            When you create an account, purchase a saree, or request a styling consultation, we collect information including your name, email address, shipping destination, phone number, and transaction details. We do not store raw credit card numbers or banking passwords on our servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#2A3425]">3. Payment Security with Razorpay</h2>
          <p>
            All online payments are tokenized and processed through PCI-DSS Level 1 compliant gateway partners (including Razorpay). Transactions are protected by 256-bit SSL encryption.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#2A3425]">4. Communication & Privé Invitations</h2>
          <p>
            We only send newsletters and private preview invitations if you explicitly opt-in to Alankriti Privé. You can unsubscribe at any time via your account dashboard or direct link.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#2A3425]">5. Concierge Contact</h2>
          <p>
            For any queries regarding your data or privacy preferences, contact our boutique concierge at <strong>concierge@alankriticouture.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
