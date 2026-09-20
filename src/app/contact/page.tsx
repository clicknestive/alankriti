'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'General Inquiry',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      showToast('Thank you for contacting Alankriti Couture. Our boutique concierge will connect with you shortly.', 'success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        inquiryType: 'General Inquiry',
        message: '',
      });
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-[#826530] font-semibold flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
          Concierge & Boutique Visit
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#2A3425]">
          Connect With Alankriti Couture
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Whether you are curating a wedding trousseau, inquiring about bespoke zari weaves, or scheduling a studio appointment, our concierge is at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left 5 Cols: Boutique Studio Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#1C241D] text-[#FAF6F0] rounded-3xl p-8 border border-[#C6A15B]/30 space-y-6">
            <h3 className="font-serif text-2xl font-bold text-[#E7D3AC]">
              Flagship Boutique Studio
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-[#BDCFB1]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Bengaluru Flagship:</strong>
                  <span>Villa 14, 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038, India</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Concierge Phone / WhatsApp:</strong>
                  <span>+91 (080) 4567 8900 / +91 98765 43210</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Email Inquiries:</strong>
                  <span>concierge@alankriticouture.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Studio Hours:</strong>
                  <span>Monday – Sunday: 10:30 AM – 8:30 PM (IST)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/10 rounded-2xl border border-[#BDCFB1]/30 text-xs text-[#FAF6F0] space-y-1">
              <p className="font-serif italic text-sm text-[#E7D3AC]">
                "Elegance Woven in Every Drape"
              </p>
              <p className="text-[11px] text-[#BDCFB1]">
                Private VIP dressing suites and high tea styling consultations available by appointment.
              </p>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Interactive Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E3DCCF] shadow-sm space-y-6">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#2A3425]">
                Send an Inquiry or Book Consultation
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Fill out the form below and an Alankriti drape stylist will respond within 24 hours.
              </p>
            </div>

            {isSuccess ? (
              <div className="bg-[#E6EFE2] p-8 rounded-2xl border border-[#A8B89A] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#5E7052] text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xl font-bold text-[#2A3425]">Inquiry Received</h4>
                <p className="text-xs text-[#43513B] max-w-sm mx-auto">
                  Namaste! Your message has reached our Indiranagar boutique studio. Our senior styling team will be in touch shortly.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="mt-2 text-xs text-[#826530] font-bold underline underline-offset-2"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Maharani Priyanka"
                      className="w-full px-3.5 py-3 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-3 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-3 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="w-full px-3.5 py-3 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Bridal Trousseau Curation">Bridal Trousseau Curation</option>
                      <option value="Custom Blouse Tailoring">Custom Blouse Tailoring</option>
                      <option value="Boutique Studio Visit Appointment">Boutique Studio Visit Appointment</option>
                      <option value="International Order Assistance">International Order Assistance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
                    Your Message / Styling Request *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about the upcoming occasion, specific saree colors or zari preferences..."
                    className="w-full p-3.5 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#5E7052] hover:bg-[#43513B] text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Submitting Inquiry...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Concierge Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
