import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q');

    const where: any = { role: 'CUSTOMER' };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { mobile: { contains: search } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true, reviews: true, addresses: true },
        },
        orders: {
          select: {
            totalAmount: true,
            paymentStatus: true,
          },
        },
      },
    });

    const formatted = customers.map((c) => {
      const totalSpent = c.orders
        .filter((o) => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        mobile: c.mobile,
        role: c.role,
        isBlocked: c.isBlocked,
        createdAt: c.createdAt,
        totalOrders: c._count.orders,
        totalReviews: c._count.reviews,
        savedAddressesCount: c._count.addresses,
        totalSpent,
      };
    });

    return NextResponse.json({ customers: formatted, total: formatted.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
