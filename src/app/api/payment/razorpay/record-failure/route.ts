import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      amount,
      status = 'FAILED', // 'FAILED' or 'CANCELLED'
      errorDescription,
      customerEmail,
      orderId,
    } = body;

    let user = await getCurrentUser();
    if (!user && customerEmail) {
      user = await prisma.user.findUnique({
        where: { email: customerEmail.toLowerCase().trim() },
      });
    }

    // Log the audit event for compliance
    await logAuditAction({
      action: status === 'CANCELLED' ? 'PAYMENT_CANCELLED' : 'PAYMENT_FAILED',
      entityType: 'Payment',
      details: `Payment attempt ${razorpay_payment_id || 'N/A'} for Razorpay Order ${razorpay_order_id || 'N/A'} was ${status.toLowerCase()}. Reason: ${errorDescription || 'Customer dismissed checkout'}`,
      adminEmail: user?.email || customerEmail || 'guest@alankriticouture.com',
    });

    // If an existing order was already generated, mark its payment status
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: status,
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      status,
      message: `Transaction recorded as ${status}.`,
    });
  } catch (error: any) {
    console.error('Record payment failure error:', error);
    return NextResponse.json(
      { error: 'Failed to record transaction state.' },
      { status: 500 }
    );
  }
}
