'use client';

import React from 'react';
import { User, Mail, Phone, ArrowRight } from 'lucide-react';

interface StepDetailsProps {
  formData: {
    name: string;
    email: string;
    mobile: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
}

export default function StepDetails({ formData, setFormData, onNext }: StepDetailsProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.mobile) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-[#FAF6F0] pb-4">
        <h3 className="font-serif text-xl font-bold text-[#2A3425]">
          1. Patron Identification
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Please provide your contact details for order delivery updates and bespoke invoice generation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Maharani Priyanka Sharma"
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, email: e.target.value }))}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
            Mobile Number *
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              required
              value={formData.mobile}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, mobile: e.target.value }))}
              placeholder="+91 98765 43210"
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 bg-[#5E7052] hover:bg-[#43513B] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
        >
          <span>Continue to Shipping Address</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
