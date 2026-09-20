'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const ok = await register(name, email, password, mobile);
    setIsSubmitting(false);
    if (ok) {
      router.push('/shop');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full border border-[#E3DCCF] shadow-royal space-y-6">
        {/* Boutique Header */}
        <div className="text-center space-y-3">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#C6A15B] mx-auto bg-[#FAF6F0] shadow-sm">
            <Image
              src="/images/logo.png"
              alt="Alankriti Couture"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#826530] font-semibold">
              Join Alankriti Privé
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A3425] mt-1">
              Create Patron Account
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Enjoy exclusive bridal previews, express checkout, and bespoke fall & pico customization.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Radhika Apte"
                className="w-full pl-10 pr-4 py-3 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
              Mobile Number (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-3 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-3 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#826530] hover:bg-[#684f23] text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Switch to Login */}
        <div className="text-center pt-2 border-t border-stone-100 text-xs text-stone-600">
          Already a patron?{' '}
          <Link href="/login" className="font-bold text-[#826530] hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
