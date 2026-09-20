import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/adminAuth';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { fabric: { contains: search } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (status === 'low_stock') where.stock = { lte: 5, gt: 0 };
    if (status === 'out_of_stock') where.stock = 0;

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { reviews: true, orderItems: true } },
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      name,
      slug,
      sku,
      description,
      price,
      originalPrice,
      discount = 0,
      stock = 10,
      fabric,
      colour,
      color,
      occasion,
      sareeLength = '5.5 metres',
      blouseDetails = '0.8 metre unstitched matching blouse piece',
      careInstructions,
      isFeatured = false,
      isActive = true,
      categoryId,
      imageUrls = [],
      images = [],
    } = data;

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: 'Please provide Product Name, Price, and Category.' }, { status: 400 });
    }

    const generatedSlug = slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + `-${Date.now().toString(36)}`;
    const generatedSku = sku?.trim()
      ? sku.trim().toUpperCase()
      : `ALC-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const resolvedFabric = fabric?.trim() || 'Handcrafted Silk';
    const resolvedColour = colour?.trim() || color?.trim() || 'Multicolor';
    const resolvedOccasion = occasion?.trim() || 'Festive & Traditional';
    const resolvedCare = careInstructions?.trim() || 'Dry clean only to maintain zari lustre and silk softness';
    const resolvedDesc = description?.trim() || name.trim();

    const rawImages = Array.isArray(imageUrls) && imageUrls.length > 0 ? imageUrls : (Array.isArray(images) ? images : []);
    const validImageUrls = rawImages.map((u: any) => (typeof u === 'string' ? u : u?.url)).filter(Boolean);

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        sku: generatedSku,
        description: resolvedDesc,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        discount: parseInt(discount) || 0,
        stock: parseInt(stock) || 0,
        fabric: resolvedFabric,
        colour: resolvedColour,
        occasion: resolvedOccasion,
        sareeLength: sareeLength.trim(),
        blouseDetails: blouseDetails.trim(),
        careInstructions: resolvedCare,
        isFeatured: Boolean(isFeatured),
        isActive: parseInt(stock) > 0 ? Boolean(isActive) : false, // Auto-mark unavailable if 0 stock
        categoryId,
        images: {
          create: validImageUrls.map((url: string, idx: number) => ({
            url: url.trim(),
            alt: `${name} photo ${idx + 1}`,
            sortOrder: idx,
          })),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });

    await logAuditAction({
      action: 'PRODUCT_CREATED',
      entityType: 'Product',
      entityId: product.id,
      details: `Created new saree "${product.name}" (SKU: ${product.sku}, Price: ₹${product.price}, Stock: ${product.stock})`,
      adminEmail: admin.email,
    });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath('/collections');
      revalidatePath(`/product/${product.slug}`);
    } catch (e) {
      console.error('Revalidation error:', e);
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
