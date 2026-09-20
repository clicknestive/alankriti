import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import ProductGallery from '@/components/product/ProductGallery';
import ProductCard from '@/components/product/ProductCard';
import ReviewSection from '@/components/product/ReviewSection';
import ProductActions from './ProductActions';
import { 
  Sparkles, 
  Award, 
  ShieldCheck, 
  Truck, 
  Scissors, 
  Star, 
  CheckCircle,
  HelpCircle,
  Clock,
  Heart
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export const revalidate = 0;

interface ProductPageProps {
  params: {
    slug: string;
  };
}

async function getProductData(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!product) return null;

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    take: 4,
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
      },
    },
  });

  return { product, relatedProducts };
}

import type { Metadata } from 'next';

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true, images: { take: 1 } },
  });

  if (!product) {
    return { title: 'Saree Not Found | Alankriti Couture' };
  }

  const imageUrl = product.images[0]?.url || '/images/logo.jpeg';

  return {
    title: `${product.name} | ${product.category?.name || 'Luxury Sarees'}`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} — Alankriti Couture`,
      description: product.description.slice(0, 160),
      images: [{ url: imageUrl, alt: product.name }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description.slice(0, 160),
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const data = await getProductData(params.slug);
  if (!data) notFound();

  const { product, relatedProducts } = data;

  const averageRating =
    product.reviews.length > 0
      ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
      : '5.0';

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://alankriticouture.com';

  // Schema.org Product & BreadcrumbList JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((img) => img.url),
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Alankriti Couture',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      priceValidUntil: '2028-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: product.reviews.length > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount: product.reviews.length,
    } : undefined,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Structured Data for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-stone-500">
        <Link href="/" className="hover:text-[#826530]">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#826530]">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category.slug}`} className="hover:text-[#826530]">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-[#2A3425] font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left 7 Cols: Image Gallery */}
        <div className="lg:col-span-7">
          <ProductGallery
            images={product.images.map((img) => ({
              id: img.id,
              url: img.url,
              alt: img.alt,
            }))}
            productName={product.name}
          />
        </div>

        {/* Right 5 Cols: Product Information & Action Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs uppercase tracking-[0.2em] text-[#826530] font-semibold">
                {product.category.name}
              </span>
              <span className="text-xs font-mono text-stone-400">
                SKU: {product.sku}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A3425] leading-tight">
              {product.name}
            </h1>

            {/* Ratings Summary Banner */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-[#C6A15B]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(Number(averageRating))
                        ? 'fill-[#C6A15B] text-[#C6A15B]'
                        : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-[#2A3425]">
                {averageRating} / 5.0
              </span>
              <span className="text-xs text-stone-400">
                ({product.reviews.length} verified reviews)
              </span>
            </div>
          </div>

          {/* Pricing & Stock Status */}
          <div className="p-4 bg-white rounded-2xl border border-[#E3DCCF] shadow-sm space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl font-bold text-[#2A3425]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-stone-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.discount > 0 && (
                <span className="bg-[#5E7052] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            <p className="text-[11px] text-stone-500">
              Inclusive of all taxes & insurance. Complimentary Bespoke Fall & Pico Stitching included.
            </p>

            <div className="pt-2 flex items-center gap-2">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-[#5E7052] font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  In Stock ({product.stock} boutique pieces available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-rose-600 font-semibold">
                  Currently Reserved / Sold Out
                </span>
              )}
            </div>
          </div>

          {/* Interactive Actions (Add to Cart, Buy Now, Quantity Selector, Wishlist) */}
          <ProductActions
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              originalPrice: product.originalPrice,
              image: product.images[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
              fabric: product.fabric,
              colour: product.colour,
              category: product.category.name,
              stock: product.stock,
            }}
          />

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-serif text-base font-bold text-[#2A3425]">Artisanal Weave Story</h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
              {product.description}
            </p>
          </div>

          {/* Saree Specifications Table */}
          <div className="bg-white rounded-2xl p-5 border border-[#E3DCCF] shadow-sm space-y-3 text-xs">
            <h3 className="font-serif text-base font-bold text-[#2A3425] border-b border-stone-100 pb-2">
              Bespoke Specifications
            </h3>
            <div className="grid grid-cols-2 gap-y-2.5 text-stone-600">
              <span className="text-stone-400">Fabric Composition:</span>
              <span className="font-medium text-[#2A3425]">{product.fabric}</span>

              <span className="text-stone-400">Signature Shade:</span>
              <span className="font-medium text-[#2A3425]">{product.colour}</span>

              <span className="text-stone-400">Ideal Occasion:</span>
              <span className="font-medium text-[#2A3425]">{product.occasion}</span>

              <span className="text-stone-400">Saree Length:</span>
              <span className="font-medium text-[#2A3425]">{product.sareeLength}</span>

              <span className="text-stone-400">Blouse Details:</span>
              <span className="font-medium text-[#2A3425]">{product.blouseDetails}</span>

              <span className="text-stone-400">Care Instructions:</span>
              <span className="font-medium text-[#2A3425]">{product.careInstructions}</span>
            </div>
          </div>

          {/* Trust Value Props */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 p-3 bg-[#E6EFE2]/60 rounded-xl border border-[#BDCFB1]">
              <Award className="w-5 h-5 text-[#5E7052] shrink-0" />
              <span className="text-xs font-semibold text-[#2A3425]">100% Pure Silk Mark</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-[#E6EFE2]/60 rounded-xl border border-[#BDCFB1]">
              <Truck className="w-5 h-5 text-[#5E7052] shrink-0" />
              <span className="text-xs font-semibold text-[#2A3425]">Express Insured Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="pt-8">
        <ReviewSection
          productId={product.id}
          productName={product.name}
          reviews={product.reviews.map((r) => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            imageUrl: r.imageUrl,
            createdAt: r.createdAt,
            user: { name: r.user.name },
          }))}
        />
      </section>

      {/* Related Sarees */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-[#E3DCCF]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#826530] font-semibold">
                More from this Weaving Cluster
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A3425] mt-0.5">
                Recommended Pairings & Sarees
              </h2>
            </div>
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="text-xs font-bold uppercase tracking-wider text-[#826530] hover:text-[#5E7052]"
            >
              View Collection →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                id={rel.id}
                name={rel.name}
                slug={rel.slug}
                categoryName={rel.category.name}
                price={rel.price}
                originalPrice={rel.originalPrice}
                discount={rel.discount}
                imageUrl={rel.images[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'}
                fabric={rel.fabric}
                colour={rel.colour}
                stock={rel.stock}
                isFeatured={rel.isFeatured}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
