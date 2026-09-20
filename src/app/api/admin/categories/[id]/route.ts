import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/adminAuth';
import { logAuditAction } from '@/lib/audit';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const { name, slug, description, imageUrl, sortOrder, isActive } = await request.json();

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        slug: slug !== undefined ? slug.trim() : existing.slug,
        description: description !== undefined ? description.trim() : existing.description,
        imageUrl: imageUrl !== undefined ? imageUrl.trim() : existing.imageUrl,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : existing.sortOrder,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    await logAuditAction({
      action: 'CATEGORY_EDITED',
      entityType: 'Category',
      entityId: id,
      details: `Updated category "${updated.name}"`,
      adminEmail: admin.email,
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 500 });
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
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!existing) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

    if (existing._count.products > 0) {
      return NextResponse.json(
        { error: `Cannot delete category containing ${existing._count.products} assigned products. Reassign or delete products first.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    await logAuditAction({
      action: 'CATEGORY_DELETED',
      entityType: 'Category',
      entityId: id,
      details: `Deleted category "${existing.name}"`,
      adminEmail: admin.email,
    });

    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
