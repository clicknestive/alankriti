'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X, Heart, ShoppingBag, User as UserIcon, LogOut, Package, Phone, Sparkles } from 'lucide-react';
import { User } from '@/context/AuthContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: { name: string; href: string }[];
  user: User | null;
  logout: () => void;
}

export default function MobileNav({
  isOpen,
  onClose,
  navLinks,
  user,
  logout,
}: MobileNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative ml-auto w-4/5 max-w-sm bg-[#FAF6F0] h-full shadow-2xl flex flex-col z-10 border-l border-[#C6A15B]/30">
        {/* Header */}
        <div className="p-5 border-b border-[#E3DCCF] flex items-center justify-between bg-[#F8F1E7]">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#C6A15B]/60 shadow-sm bg-white">
              <Image
                src="/images/logo.png"
                alt="Alankriti Couture"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <p className="font-brand font-bold text-base text-[#2A3425] tracking-wider">
                ALANKRITI
              </p>
              <p className="text-[9px] tracking-widest text-[#826530] uppercase">
                COUTURE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-200/50"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Status Bar */}
        <div className="px-5 py-3.5 bg-[#E6EFE2]/70 border-b border-[#BDCFB1]/60 flex items-center justify-between text-xs">
          {user ? (
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded-full bg-[#5E7052] text-white flex items-center justify-center font-bold text-[10px]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-[#2A3425] truncate">Namaste, {user.name}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-[#43513B] font-medium">Welcome to Alankriti</span>
              <Link
                href="/login"
                onClick={onClose}
                className="text-[#826530] font-semibold underline underline-offset-2"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto py-4 px-5 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onClose}
                className={`flex items-center justify-between py-3 px-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#A8B89A]/30 text-[#2A3425] font-bold border-l-4 border-[#C6A15B]'
                    : 'text-[#2A3425] hover:bg-[#E6EFE2]/50'
                }`}
              >
                <span>{link.name}</span>
                <Sparkles className={`w-3.5 h-3.5 ${isActive ? 'text-[#C6A15B]' : 'text-stone-300'}`} />
              </Link>
            );
          })}

          <div className="border-t border-[#E3DCCF] my-4 pt-4 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#826530] px-3 mb-2">
              My Boutique Space
            </p>
            {user ? (
              <>
                <Link
                  href="/account/orders"
                  onClick={onClose}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm text-[#2A3425] hover:bg-[#E6EFE2]/50"
                >
                  <Package className="w-4 h-4 text-[#C6A15B]" />
                  <span>My Orders & Tracking</span>
                </Link>
                <Link
                  href="/account/profile"
                  onClick={onClose}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm text-[#2A3425] hover:bg-[#E6EFE2]/50"
                >
                  <UserIcon className="w-4 h-4 text-[#A8B89A]" />
                  <span>Saved Addresses & Profile</span>
                </Link>
                <button
                  onClick={() => {
                    onClose();
                    logout();
                  }}
                  className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm text-rose-700 hover:bg-rose-50 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="px-3 py-2">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="block w-full py-2.5 text-center bg-[#5E7052] text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm hover:bg-[#43513B]"
                >
                  Login / Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer Tagline */}
        <div className="p-4 border-t border-[#E3DCCF] bg-[#F8F1E7] text-center">
          <p className="text-[11px] font-serif italic text-[#826530]">
            "Drapes That Define, Jewellery That Inspires"
          </p>
        </div>
      </div>
    </div>
  );
}
