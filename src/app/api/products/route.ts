import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const fabric = searchParams.get('fabric');
    const occasion = searchParams.get('occasion');
    const colour = searchParams.get('colour');
    const priceRange = searchParams.get('priceRange');
    const query = searchParams.get('q');
    const featured = searchParams.get('featured');
    const sortBy = searchParams.get('sortBy') || 'featured';

    const whereClause: any = {
      isActive: true,
    };

    if (categorySlug) {
      whereClause.category = {
        slug: categorySlug,
      };
    }

    if (fabric) {
      whereClause.fabric = {
        contains: fabric,
      };
    }

    if (occasion) {
      whereClause.occasion = {
        contains: occasion,
      };
    }

    if (colour) {
      whereClause.colour = {
        contains: colour,
      };
    }

    if (featured === 'true') {
      whereClause.isFeatured = true;
    }

    if (priceRange) {
      const [minStr, maxStr] = priceRange.split('-');
      const min = parseFloat(minStr);
      const max = parseFloat(maxStr);
      whereClause.price = {};
      if (!isNaN(min)) whereClause.price.gte = min;
      if (!isNaN(max)) whereClause.price.lte = max;
    }

    if (query) {
      const q = query.trim();
      whereClause.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { fabric: { contains: q } },
        { colour: { contains: q } },
        { occasion: { contains: q } },
        { category: { name: { contains: q } } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sortBy === 'featured') {
      orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
