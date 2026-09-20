import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing Razorpay signature' }, { status: 400 });
    }

    // 1. Verify Webhook Signature using RAZORPAY_WEBHOOK_SECRET
    const isValid = verifyWebhookSignature({ rawBody, signature });
    if (!isValid) {
      await logAuditAction({
        action: 'WEBHOOK_SIGNATURE_FAILED',
        entityType: 'Webhook',
        details: 'Received unauthorized Razorpay webhook call with invalid HMAC signature.',
        adminEmail: 'security@alankriticouture.com',
      });
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;
    const refundEntity = payload.payload?.refund?.entity;

    // 2. Handle Events
    switch (event) {
      case 'payment.captured': {
        const paymentId = paymentEntity?.id;
        const razorpayOrderId = paymentEntity?.order_id;
        const amount = paymentEntity?.amount ? paymentEntity.amount / 100 : 0;

        if (paymentId) {
          // Check if payment already exists
          const existingPayment = await prisma.payment.findUnique({
            where: { paymentId },
          });

          if (existingPayment) {
            await prisma.payment.update({
              where: { paymentId },
              data: { status: 'CAPTURED' },
            });
          }

          // Check if order exists with this razorpay order ID
          if (razorpayOrderId) {
            const order = await prisma.order.findFirst({
              where: { razorpayOrderId },
            });
            if (order && order.paymentStatus !== 'PAID') {
              await prisma.order.update({
                where: { id: order.id },
                data: {
                  paymentStatus: 'PAID',
                  orderStatus: 'PAYMENT CONFIRMED',
                  razorpayPaymentId: paymentId,
                },
              });
            }
          }

          await logAuditAction({
            action: 'WEBHOOK_PAYMENT_CAPTURED',
            entityType: 'Payment',
            entityId: paymentId,
            details: `Webhook confirmed payment.captured for ₹${amount} (Razorpay Order: ${razorpayOrderId})`,
            adminEmail: 'webhook@razorpay.com',
          });
        }
        break;
      }

      case 'payment.failed': {
        const paymentId = paymentEntity?.id;
        const errorDescription = paymentEntity?.error_description || 'Payment failed';

        if (paymentId) {
          await prisma.payment.updateMany({
            where: { paymentId },
            data: {
              status: 'FAILED',
              errorDescription,
            },
          });

          await logAuditAction({
            action: 'WEBHOOK_PAYMENT_FAILED',
            entityType: 'Payment',
            entityId: paymentId,
            details: `Webhook payment.failed: ${errorDescription}`,
            adminEmail: 'webhook@razorpay.com',
          });
        }
        break;
      }

      case 'refund.processed': {
        const refundId = refundEntity?.id;
        const paymentId = refundEntity?.payment_id;
        const refundAmount = refundEntity?.amount ? refundEntity.amount / 100 : 0;

        if (paymentId) {
          const payment = await prisma.payment.findUnique({
            where: { paymentId },
          });

          if (payment) {
            await prisma.payment.update({
              where: { paymentId },
              data: {
                status: 'REFUNDED',
                refundId,
                refundAmount,
                refundStatus: 'processed',
              },
            });

            await prisma.order.update({
              where: { id: payment.orderId },
              data: {
                paymentStatus: 'REFUNDED',
                orderStatus: 'REFUNDED',
              },
            });
          }

          await logAuditAction({
            action: 'WEBHOOK_REFUND_PROCESSED',
            entityType: 'Refund',
            entityId: refundId,
            details: `Webhook refund.processed for payment ${paymentId}: ₹${refundAmount}`,
            adminEmail: 'webhook@razorpay.com',
          });
        }
        break;
      }

      default:
        // Log other events without error
        await logAuditAction({
          action: 'WEBHOOK_EVENT_RECEIVED',
          entityType: 'Webhook',
          details: `Received unhandled Razorpay event: ${event}`,
          adminEmail: 'webhook@razorpay.com',
        });
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Razorpay webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook processing error.' },
      { status: 500 }
    );
  }
}
