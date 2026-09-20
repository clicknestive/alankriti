import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/adminAuth';
import { logAuditAction } from '@/lib/audit';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        reviews: { include: { user: { select: { name: true } } } },
      },
    });

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const data = await request.json();
    const {
      name,
      slug,
      sku,
      description,
      price,
      originalPrice,
      discount,
      stock,
      fabric,
      colour,
      color,
      occasion,
      sareeLength,
      blouseDetails,
      careInstructions,
      isFeatured,
      isActive,
      categoryId,
      imageUrls,
      images,
    } = data;

    const newStock = stock !== undefined ? parseInt(stock) : existing.stock;
    const newPrice = price !== undefined ? parseFloat(price) : existing.price;

    // Automatic rule: mark unavailable when stock reaches zero
    const finalIsActive = newStock > 0 ? (isActive !== undefined ? Boolean(isActive) : existing.isActive) : false;

    // Update images if provided (either imageUrls or images array)
    const rawImages = Array.isArray(imageUrls) ? imageUrls : (Array.isArray(images) ? images : null);
    if (rawImages !== null) {
      const validUrls = rawImages.map((u: any) => (typeof u === 'string' ? u : u?.url)).filter(Boolean);
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (validUrls.length > 0) {
        await prisma.productImage.createMany({
          data: validUrls.map((url: string, idx: number) => ({
            productId: id,
            url: url.trim(),
            alt: `${name || existing.name} image ${idx + 1}`,
            sortOrder: idx,
          })),
        });
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        slug: slug !== undefined ? slug.trim() : existing.slug,
        sku: sku !== undefined && sku ? sku.trim().toUpperCase() : existing.sku,
        description: description !== undefined ? description.trim() : existing.description,
        price: newPrice,
        originalPrice: originalPrice !== undefined ? (originalPrice ? parseFloat(originalPrice) : null) : existing.originalPrice,
        discount: discount !== undefined ? parseInt(discount) : existing.discount,
        stock: newStock,
        fabric: fabric !== undefined ? fabric.trim() : existing.fabric,
        colour: colour !== undefined ? colour.trim() : (color !== undefined ? color.trim() : existing.colour),
        occasion: occasion !== undefined ? occasion.trim() : existing.occasion,
        sareeLength: sareeLength !== undefined ? sareeLength.trim() : existing.sareeLength,
        blouseDetails: blouseDetails !== undefined ? blouseDetails.trim() : existing.blouseDetails,
        careInstructions: careInstructions !== undefined ? careInstructions.trim() : existing.careInstructions,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existing.isFeatured,
        isActive: finalIsActive,
        categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
      },
      include: {
        category: true,
        images: true,
      },
    });

    // Detailed Audit Logging
    const auditDetails = [];
    if (existing.price !== newPrice) {
      auditDetails.push(`Price adjusted from ₹${existing.price} to ₹${newPrice}`);
      await logAuditAction({
        action: 'PRICE_CHANGED',
        entityType: 'Product',
        entityId: id,
        details: `Price changed for "${updated.name}" from ₹${existing.price} to ₹${newPrice}`,
        adminEmail: admin.email,
      });
    }
    if (existing.stock !== newStock) {
      auditDetails.push(`Stock adjusted from ${existing.stock} to ${newStock}`);
      await logAuditAction({
        action: 'STOCK_CHANGED',
        entityType: 'Inventory',
        entityId: id,
        details: `Stock updated for "${updated.name}" from ${existing.stock} to ${newStock} pieces`,
        adminEmail: admin.email,
      });
    }

    await logAuditAction({
      action: 'PRODUCT_EDITED',
      entityType: 'Product',
      entityId: id,
      details: `Updated product "${updated.name}" (${auditDetails.join(', ') || 'attributes updated'})`,
      adminEmail: admin.email,
    });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath('/collections');
      revalidatePath(`/product/${updated.slug}`);
    } catch (e) {
      console.error('Revalidation error:', e);
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // Clean up all child relational dependencies to ensure deletion never fails
    await prisma.review.deleteMany({ where: { productId: id } });
    await prisma.wishlist.deleteMany({ where: { productId: id } });
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.orderItem.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    await logAuditAction({
      action: 'PRODUCT_DELETED',
      entityType: 'Product',
      entityId: id,
      details: `Permanently deleted product "${existing.name}" (SKU: ${existing.sku})`,
      adminEmail: admin.email,
    });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath('/collections');
      revalidatePath(`/product/${existing.slug}`);
    } catch (e) {
      console.error('Revalidation error:', e);
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
