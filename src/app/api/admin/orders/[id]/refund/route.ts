import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/adminAuth';
import { createRazorpayRefund } from '@/lib/razorpay';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const orderId = params.id;
    const body = await request.json().catch(() => ({}));
    const { refundReason, restockItems = true } = body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        items: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentStatus === 'REFUNDED') {
      return NextResponse.json({ error: 'Order is already refunded' }, { status: 400 });
    }

    const paymentId = order.payment?.paymentId || order.razorpayPaymentId || `pay_sim_${Date.now()}`;
    const refundAmount = order.totalAmount;

    // 1. Process refund with Razorpay
    const refund = await createRazorpayRefund({
      paymentId,
      amount: refundAmount,
      notes: {
        orderId: order.id,
        reason: refundReason || 'Patron requested return & refund',
        adminEmail: admin.email,
      },
    });

    // 2. Database update within transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // a. Update or Create Payment Record
      if (order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            status: 'REFUNDED',
            refundId: refund.id,
            refundAmount,
            refundStatus: refund.status || 'processed',
          },
        });
      } else {
        await tx.payment.create({
          data: {
            paymentId,
            razorpayOrderId: order.razorpayOrderId || `order_rec_${Date.now()}`,
            amount: refundAmount,
            status: 'REFUNDED',
            refundId: refund.id,
            refundAmount,
            refundStatus: refund.status || 'processed',
            userId: order.userId,
            orderId: order.id,
          },
        });
      }

      // b. Update Order Status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'REFUNDED',
          orderStatus: 'REFUNDED',
          adminNotes: order.adminNotes
            ? `${order.adminNotes} | Refunded ₹${refundAmount} on ${new Date().toISOString()}`
            : `Refunded ₹${refundAmount} on ${new Date().toISOString()}`,
        },
        include: {
          items: true,
          payment: true,
        },
      });

      // c. Restock Inventory if selected
      if (restockItems && order.items.length > 0) {
        for (const it of order.items) {
          await tx.product.update({
            where: { id: it.productId },
            data: {
              stock: { increment: it.quantity },
              isActive: true, // reactivate when stock is restored
            },
          });
        }
      }

      return updated;
    });

    // 3. Log Audit
    await logAuditAction({
      action: 'ORDER_REFUNDED',
      entityType: 'Order',
      entityId: orderId,
      details: `Full refund of ₹${refundAmount} processed for Order ${orderId} by ${admin.email}. Razorpay Refund ID: ${refund.id}. Inventory restocked: ${restockItems}`,
      adminEmail: admin.email,
    });

    return NextResponse.json({
      success: true,
      refund,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Refund processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process refund.' },
      { status: 500 }
    );
  }
}
