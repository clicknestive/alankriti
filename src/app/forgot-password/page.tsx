'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
        if (data.resetToken) {
          setResetToken(data.resetToken);
        }
        showToast('Password reset link dispatched.', 'success');
      }
    } catch (e) {
      showToast('Error requesting password reset', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full border border-[#E3DCCF] shadow-royal space-y-6">
        <div className="text-center space-y-3">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#C6A15B] mx-auto bg-[#FAF6F0] shadow-sm">
            <Image
              src="/images/logo.jpeg"
              alt="Alankriti Couture"
              fill
              className="object-cover object-[center_35%]"
            />
          </div>
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#826530] font-semibold">
              Security Assistance
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A3425] mt-1">
              Reset Password
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Enter your registered email address to receive password recovery instructions.
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#E6EFE2] text-[#5E7052] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-stone-600">
              Recovery instructions have been sent to <strong>{email}</strong>.
            </p>

            {resetToken && (
              <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#BDCFB1] text-xs space-y-2">
                <p className="text-[11px] text-[#826530] font-semibold">
                  Demo Fast-Track Reset Link:
                </p>
                <Link
                  href={`/reset-password?token=${resetToken}`}
                  className="inline-block px-4 py-1.5 bg-[#5E7052] text-white rounded-lg text-xs font-semibold"
                >
                  Click Here to Set New Password
                </Link>
              </div>
            )}

            <div className="pt-2">
              <Link
                href="/login"
                className="text-xs text-[#826530] font-bold hover:underline"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
                Registered Email
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#5E7052] hover:bg-[#43513B] text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Dispatching Link...' : 'Send Recovery Link'}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#2A3425]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
