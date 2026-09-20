import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/adminAuth';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        payment: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true, payment: true },
    });
    if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const {
      orderStatus,
      paymentStatus,
      shippingCarrier,
      trackingNumber,
      adminNotes,
    } = await request.json();

    // Handle inventory restocking on cancellation / return
    const wasInactive = existing.orderStatus === 'CANCELLED' || existing.orderStatus === 'RETURNED' || existing.orderStatus === 'REFUNDED';
    const nowInactive = orderStatus === 'CANCELLED' || orderStatus === 'RETURNED' || orderStatus === 'REFUNDED';

    if (!wasInactive && nowInactive && existing.items.length > 0) {
      // Restock items
      for (const it of existing.items) {
        await prisma.product.update({
          where: { id: it.productId },
          data: {
            stock: { increment: it.quantity },
            isActive: true,
          },
        });
      }
      await logAuditAction({
        action: 'INVENTORY_RESTOCKED',
        entityType: 'Order',
        entityId: id,
        details: `Restocked items for Order ${id} due to status transition to ${orderStatus}`,
        adminEmail: admin.email,
      });
    } else if (wasInactive && !nowInactive && orderStatus && existing.items.length > 0) {
      // Re-decrement items
      for (const it of existing.items) {
        const p = await prisma.product.findUnique({ where: { id: it.productId } });
        const newStock = Math.max(0, (p?.stock || 0) - it.quantity);
        await prisma.product.update({
          where: { id: it.productId },
          data: {
            stock: newStock,
            isActive: newStock > 0,
          },
        });
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: orderStatus || existing.orderStatus,
        paymentStatus: paymentStatus || existing.paymentStatus,
        shippingCarrier: shippingCarrier !== undefined ? shippingCarrier : existing.shippingCarrier,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : existing.trackingNumber,
        adminNotes: adminNotes !== undefined ? adminNotes : existing.adminNotes,
      },
      include: {
        user: true,
        payment: true,
        items: true,
      },
    });

    // Audit logs for critical actions
    if (orderStatus && orderStatus !== existing.orderStatus) {
      await logAuditAction({
        action: 'ORDER_STATUS_CHANGED',
        entityType: 'Order',
        entityId: id,
        details: `Order ${id} status changed from "${existing.orderStatus}" to "${orderStatus}" by ${admin.email}`,
        adminEmail: admin.email,
      });
    }

    if (shippingCarrier && shippingCarrier !== existing.shippingCarrier) {
      await logAuditAction({
        action: 'ORDER_DISPATCH_UPDATED',
        entityType: 'Order',
        entityId: id,
        details: `Carrier: ${shippingCarrier}, Tracking: ${trackingNumber || 'N/A'} for Order ${id}`,
        adminEmail: admin.email,
      });
    }

    if (paymentStatus && paymentStatus !== existing.paymentStatus) {
      await logAuditAction({
        action: 'PAYMENT_STATUS_CHANGED',
        entityType: 'Order',
        entityId: id,
        details: `Payment status for Order ${id} changed from "${existing.paymentStatus}" to "${paymentStatus}"`,
        adminEmail: admin.email,
      });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
