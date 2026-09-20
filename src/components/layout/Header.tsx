'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  Package, 
  MapPin 
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import MobileNav from './MobileNav';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, setIsCartOpen } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { user, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Collections', href: '/collections' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* Main Sticky Green Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#2A3425]/95 backdrop-blur-md shadow-lg py-2 border-b border-[#C6A15B]/30'
            : 'bg-[#2A3425] py-3.5 border-b border-[#C6A15B]/25'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border border-[#C6A15B] shadow-md group-hover:scale-105 transition-transform duration-300 bg-[#F8F1E7] flex items-center justify-center shrink-0">
                  <Image
                    src="/images/logo.png"
                    alt="Alankriti Couture"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-brand font-bold text-lg sm:text-xl md:text-2xl text-[#F8F1E7] tracking-[0.14em] uppercase group-hover:text-[#C6A15B] transition-colors leading-tight">
                    Alankriti
                  </span>
                  <span className="text-[10px] tracking-[0.3em] uppercase text-[#C6A15B] font-medium leading-none">
                    Couture
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-medium tracking-wide uppercase transition-all duration-200 relative py-1 ${
                      isActive
                        ? 'text-[#C6A15B] font-semibold'
                        : 'text-[#F8F1E7]/90 hover:text-[#C6A15B]'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C6A15B] rounded-full animate-fadeIn" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions (Search, Wishlist, Cart, Account) */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-[#F8F1E7] hover:text-[#C6A15B] hover:bg-white/10 rounded-full transition-colors"
                aria-label="Search Sarees"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                href="/shop?tab=wishlist"
                className="p-2 text-[#F8F1E7] hover:text-[#C6A15B] hover:bg-white/10 rounded-full transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C6A15B] text-[#1C241D] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Bag / Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-[#F8F1E7] hover:text-[#C6A15B] hover:bg-white/10 rounded-full transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C6A15B] text-[#1C241D] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* User Account / Login */}
              <div className="relative">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                      className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-white/10 text-[#F8F1E7] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#C6A15B] text-[#1C241D] flex items-center justify-center font-bold text-xs border border-[#F8F1E7]/50">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 hidden sm:block text-[#E7D3AC]" />
                    </button>

                    {/* Account Dropdown */}
                    {isAccountMenuOpen && (
                      <div
                        onMouseLeave={() => setIsAccountMenuOpen(false)}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-[#E3DCCF] py-2 z-50 animate-fadeIn"
                      >
                        <div className="px-4 py-2 border-b border-stone-100">
                          <p className="text-xs text-stone-500">Signed in as</p>
                          <p className="text-sm font-semibold text-[#2A3425] truncate">{user.name}</p>
                          <p className="text-xs text-stone-400 truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/account/profile"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#2A3425] hover:bg-[#FAF6F0] hover:text-[#826530]"
                        >
                          <UserIcon className="w-4 h-4 text-[#A8B89A]" />
                          My Profile & Addresses
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#2A3425] hover:bg-[#FAF6F0] hover:text-[#826530]"
                        >
                          <Package className="w-4 h-4 text-[#C6A15B]" />
                          My Orders & Tracking
                        </Link>
                        <div className="border-t border-stone-100 mt-1 pt-1">
                          <button
                            onClick={() => {
                              setIsAccountMenuOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-700 hover:bg-rose-50 text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#C6A15B] text-xs font-semibold text-[#F8F1E7] hover:bg-[#C6A15B] hover:text-[#1C241D] transition-all duration-200"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Link>
                )}
              </div>

              {/* Mobile Hamburger Menu Toggle */}
              <button
                onClick={() => setIsMobileNavOpen(true)}
                className="p-2 md:hidden text-[#F8F1E7] hover:text-[#C6A15B] rounded-lg"
                aria-label="Open Navigation"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Interactive Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-fadeIn">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#C6A15B]/40 relative">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <span className="text-xs tracking-[0.2em] uppercase text-[#826530] font-medium">Boutique Search</span>
              <h3 className="text-2xl font-serif text-[#2A3425] mt-1">Discover Handcrafted Elegance</h3>
            </div>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Mysore Silk, Kanjivaram, Organza, Bridal, Zari..."
                autoFocus
                className="w-full pl-12 pr-28 py-3.5 bg-white rounded-xl border border-[#BDCFB1] focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 outline-none text-[#2A3425] placeholder:text-stone-400"
              />
              <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#5E7052] hover:bg-[#43513B] text-white px-5 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                Search
              </button>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-stone-600">
              <span className="font-medium text-[#2A3425]">Popular:</span>
              {['Mysore Silk', 'Kanjivaram Bridal', 'Pure Banarasi', 'Floral Organza', 'Rani Pink', 'Soft Silk'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    router.push(`/shop?q=${encodeURIComponent(term)}`);
                    setIsSearchOpen(false);
                  }}
                  className="px-3 py-1 bg-[#E6EFE2] hover:bg-[#BDCFB1] text-[#43513B] rounded-full transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        navLinks={navLinks}
        user={user}
        logout={logout}
      />
    </>
  );
}
