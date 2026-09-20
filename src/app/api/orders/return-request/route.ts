import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to request a return' }, { status: 401 });
    }

    const { orderId, reason } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: 'Order not found in your vault' }, { status: 404 });
    }

    if (order.orderStatus !== 'DELIVERED') {
      return NextResponse.json(
        { error: 'Returns can only be requested for delivered orders.' },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: 'RETURN REQUESTED',
        customerNotes: reason
          ? `${order.customerNotes || ''} | Return Reason: ${reason}`.trim()
          : order.customerNotes,
      },
    });

    await logAuditAction({
      action: 'RETURN_REQUESTED',
      entityType: 'Order',
      entityId: orderId,
      details: `Customer ${user.email} requested return for Order ${orderId}. Reason: ${reason || 'Not specified'}`,
      adminEmail: user.email,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('Return request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit return request' },
      { status: 500 }
    );
  }
}
