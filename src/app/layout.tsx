import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://alankriticouture.com'),
  title: {
    default: 'ALANKRITI COUTURE | Drapes That Define, Jewellery That Inspires',
    template: '%s | Alankriti Couture',
  },
  description:
    'Discover timeless luxury sarees crafted for moments that deserve to be remembered. Pure Mysore Silk, Kanjivaram Bridal, Banarasi Brocades, Organza & Designer Sarees with certified Silk Mark authentication.',
  keywords: [
    'Alankriti Couture',
    'luxury sarees online',
    'Kanjivaram bridal silk sarees',
    'pure Mysore silk saree',
    'Banarasi brocade saree',
    'designer Indian sarees',
    'Silk Mark certified sarees',
    'handcrafted silk drapes',
  ],
  authors: [{ name: 'Alankriti Couture Atelier' }],
  creator: 'Alankriti Couture',
  publisher: 'Alankriti Couture',
  icons: {
    icon: '/images/logo.jpeg',
    apple: '/images/logo.jpeg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://alankriticouture.com',
    siteName: 'Alankriti Couture',
    title: 'ALANKRITI COUTURE | Drapes That Define, Jewellery That Inspires',
    description:
      'Timeless luxury handcrafted Indian sarees. Pure Mysore & Kanjivaram Silk, Banarasi Brocades, Organza & Bridal Weaves.',
    images: [
      {
        url: '/images/logo.jpeg',
        width: 1200,
        height: 630,
        alt: 'Alankriti Couture Heritage Drapes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ALANKRITI COUTURE | Drapes That Define, Jewellery That Inspires',
    description:
      'Timeless luxury handcrafted Indian sarees. Pure Mysore & Kanjivaram Silk, Banarasi Brocades, Organza & Bridal Weaves.',
    images: ['/images/logo.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#FAF6F0] text-[#222B23] antialiased selection:bg-[#C6A15B] selection:text-white">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <CartDrawer />
                <Footer />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
