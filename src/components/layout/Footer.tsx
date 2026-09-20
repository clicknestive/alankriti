'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="bg-[#1C241D] text-[#F8F1E7] border-t-2 border-[#C6A15B]/40 pt-16 pb-8">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Col 1: Brand Info & Logo */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#C6A15B] shadow-md bg-[#F8F1E7]">
              <Image
                src="/images/logo.png"
                alt="Alankriti Couture"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-brand font-bold text-2xl text-[#FAF6F0] tracking-[0.14em] uppercase block">
                Alankriti
              </span>
              <span className="text-xs tracking-[0.35em] text-[#C6A15B] uppercase block">
                Couture
              </span>
            </div>
          </div>

          <p className="text-sm text-[#BDCFB1] italic font-serif leading-relaxed">
            "Drapes That Define, Jewellery That Inspires"
          </p>
          <p className="text-xs text-[#FAF6F0]/80 leading-relaxed max-w-sm">
            Alankriti Couture is dedicated to reviving and celebrating the timeless legacy of Indian handloom weaves. Each saree is a curated symphony of pure silk, tested zari, and generations of artisanal mastery.
          </p>

          <div className="pt-2 flex items-center space-x-3 text-[#C6A15B]">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-[#2A3425] border border-[#C6A15B]/40 flex items-center justify-center hover:bg-[#C6A15B] hover:text-[#1C241D] transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-[#2A3425] border border-[#C6A15B]/40 flex items-center justify-center hover:bg-[#C6A15B] hover:text-[#1C241D] transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Col 2: Collections */}
        <div className="space-y-3">
          <h4 className="font-serif text-lg font-semibold text-[#E7D3AC] tracking-wide border-b border-[#C6A15B]/30 pb-2">
            Heritage Collections
          </h4>
          <ul className="space-y-2 text-xs text-[#BDCFB1]">
            <li>
              <Link href="/shop?category=pure-silk" className="hover:text-[#C6A15B] transition-colors">
                Pure Silk
              </Link>
            </li>
            <li>
              <Link href="/shop?category=semi-crepe" className="hover:text-[#C6A15B] transition-colors">
                Semi Crepe
              </Link>
            </li>
            <li>
              <Link href="/shop?category=organza" className="hover:text-[#C6A15B] transition-colors">
                Organza
              </Link>
            </li>
            <li>
              <Link href="/shop?category=cotton-handloom" className="hover:text-[#C6A15B] transition-colors">
                Cotton Handloom
              </Link>
            </li>
            <li>
              <Link href="/shop?category=georgette" className="hover:text-[#C6A15B] transition-colors">
                Georgette
              </Link>
            </li>
            <li>
              <Link href="/collections" className="text-[#C6A15B] hover:underline font-medium pt-1 block">
                View All 5 Collections →
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Boutique & Policies */}
        <div className="space-y-3">
          <h4 className="font-serif text-lg font-semibold text-[#E7D3AC] tracking-wide border-b border-[#C6A15B]/30 pb-2">
            Customer Care
          </h4>
          <ul className="space-y-2 text-xs text-[#BDCFB1]">
            <li>
              <Link href="/about" className="hover:text-[#C6A15B] transition-colors">
                About Alankriti
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[#C6A15B] transition-colors">
                Boutique Concierge & Visit
              </Link>
            </li>
            <li>
              <Link href="/reviews" className="hover:text-[#C6A15B] transition-colors">
                Customer Reviews
              </Link>
            </li>
            <li>
              <Link href="/shipping-policy" className="hover:text-[#C6A15B] transition-colors">
                Shipping & Delivery
              </Link>
            </li>
            <li>
              <Link href="/return-policy" className="hover:text-[#C6A15B] transition-colors">
                Return & Exchange Policy
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-[#C6A15B] transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-[#C6A15B] transition-colors">
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Boutique Concierge */}
        <div className="space-y-3">
          <h4 className="font-serif text-lg font-semibold text-[#E7D3AC] tracking-wide border-b border-[#C6A15B]/30 pb-2">
            Alankriti Concierge
          </h4>
          <p className="text-xs text-[#BDCFB1] leading-relaxed">
            Our bridal and handloom consultants are available for personalized private drape consultations.
          </p>

          <div className="pt-2 text-xs text-[#BDCFB1] space-y-2.5">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
              <span>Flagship Boutique: 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#C6A15B] shrink-0" />
              <span>+91 63660 49905</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#C6A15B] shrink-0" />
              <span>alankrticouture@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-[#A8B89A]/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#BDCFB1]">
        <p>© {new Date().getFullYear()} ALANKRITI COUTURE. All Rights Reserved. Crafted for Timeless Elegance.</p>
        <p className="mt-2 sm:mt-0 italic font-serif text-[#C6A15B]">
          "Elegance Woven in Every Drape"
        </p>
      </div>
    </footer>
  );
}
