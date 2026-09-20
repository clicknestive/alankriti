"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const { admin, loading, adminLogin } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && admin) {
      router.replace("/admin/dashboard");
    }
  }, [admin, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await adminLogin(email, password);
    setSubmitting(false);
    if (result.success) {
      router.replace("/admin/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  };

  if (loading || admin) {
    return (
      <div className="min-h-screen bg-[#1C241D] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C6A15B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C241D] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FAF6F0] border-2 border-[#C6A15B] mb-4 overflow-hidden shadow-md">
            <Image
              src="/images/logo.png"
              alt="Alankriti Couture"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-[#FAF6F0] text-xl font-semibold tracking-wide">Alankriti Couture</h1>
          <p className="text-[#5E7052] text-sm mt-1">Admin Console</p>
        </div>

        {/* Login card */}
        <div className="bg-[#2A3425] rounded-2xl p-7 border border-[#3A4635]">
          <h2 className="text-[#FAF6F0] text-base font-medium mb-5">Sign in to continue</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-900/30 border border-red-700/40 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#BDCFB1] text-xs font-medium mb-1.5 tracking-wide uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                placeholder="admin@alankriticouture.com"
                className="w-full bg-[#1C241D] text-[#FAF6F0] placeholder-[#43513B] border border-[#3A4635] focus:border-[#C6A15B] rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#BDCFB1] text-xs font-medium mb-1.5 tracking-wide uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  className="w-full bg-[#1C241D] text-[#FAF6F0] placeholder-[#43513B] border border-[#3A4635] focus:border-[#C6A15B] rounded-lg px-4 py-2.5 text-sm outline-none transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43513B] hover:text-[#BDCFB1] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#C6A15B] hover:bg-[#826530] text-[#1C241D] font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        {/* Dev hint */}
        <div className="mt-4 p-3 bg-[#2A3425]/60 border border-[#3A4635] rounded-xl text-center">
          <p className="text-[#5E7052] text-xs">
            Development credentials are set via environment variables
          </p>
        </div>
      </div>
    </div>
  );
}
