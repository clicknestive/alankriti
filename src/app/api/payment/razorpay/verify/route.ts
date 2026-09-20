import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { generateOrderId } from '@/lib/utils';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerData,
      addressData,
      items,
      totalAmount,
      discountAmount = 0,
      shippingAmount = 0,
      paymentMethod = 'RAZORPAY',
      customerNotes,
    } = body;

    // 1. Basic validation
    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { error: 'Incomplete payment authorization parameters.' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cannot confirm order with an empty shopping bag.' },
        { status: 400 }
      );
    }

    // 2. Cryptographic Signature Verification
    const isValidSignature = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature || '',
    });

    if (!isValidSignature) {
      // Log security anomaly
      await logAuditAction({
        action: 'PAYMENT_SIGNATURE_FAILED',
        entityType: 'Payment',
        details: `Invalid signature for Razorpay Order ${razorpay_order_id}, Payment ${razorpay_payment_id}`,
        adminEmail: 'security@alankriticouture.com',
      });

      return NextResponse.json(
        { error: 'Payment signature verification failed. Transaction flagged.' },
        { status: 400 }
      );
    }

    // 3. User Resolution (Logged in or Guest)
    let user = await getCurrentUser();
    if (!user && customerData?.email) {
      const email = customerData.email.toLowerCase().trim();
      let existing = await prisma.user.findUnique({ where: { email } });
      if (!existing) {
        existing = await prisma.user.create({
          data: {
            name: customerData.name || 'Patron',
            email,
            passwordHash: 'GUEST_USER',
            mobile: customerData.mobile || null,
          },
        });
      }
      user = existing;
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Customer account or guest profile required.' },
        { status: 400 }
      );
    }

    // 4. Pre-check Stock Concurrency before Transaction
    for (const it of items) {
      const p = await prisma.product.findUnique({
        where: { id: it.productId || it.id },
        select: { id: true, name: true, stock: true },
      });
      if (!p || p.stock < (it.quantity || 1)) {
        return NextResponse.json(
          {
            error: `Inventory conflict: "${it.name || 'Item'}" has insufficient stock (${p?.stock || 0} left). Payment cannot be confirmed.`,
          },
          { status: 409 }
        );
      }
    }

    // 5. Execute Atomic Database Order & Stock Settlement Transaction
    const orderId = generateOrderId();
    const shippingAddressSnapshot = JSON.stringify({
      fullName: addressData?.fullName || customerData?.name || user.name,
      phone: addressData?.phone || customerData?.mobile || user.mobile || '',
      street: addressData?.street || '',
      landmark: addressData?.landmark || '',
      city: addressData?.city || '',
      state: addressData?.state || '',
      pincode: addressData?.pincode || '',
    });

    const result = await prisma.$transaction(async (tx) => {
      // a. Create Order
      const order = await tx.order.create({
        data: {
          id: orderId,
          userId: user!.id,
          totalAmount: Number(totalAmount),
          discountAmount: Number(discountAmount),
          shippingAmount: Number(shippingAmount),
          paymentStatus: 'PAID',
          orderStatus: 'PAYMENT CONFIRMED',
          paymentMethod,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          shippingAddressSnapshot,
          customerNotes: customerNotes || null,
          items: {
            create: items.map((it: any) => ({
              productId: it.productId || it.id,
              productName: it.name,
              productSlug: it.slug || '',
              productImage: it.image || (Array.isArray(it.images) ? it.images[0] : ''),
              fabric: it.fabric || null,
              colour: it.colour || null,
              price: Number(it.price),
              quantity: Number(it.quantity || 1),
              total: Number(it.price) * Number(it.quantity || 1),
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // b. Create Payment Record
      const payment = await tx.payment.create({
        data: {
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature || null,
          amount: Number(totalAmount),
          currency: 'INR',
          status: 'CAPTURED',
          method: paymentMethod,
          userId: user!.id,
          orderId: order.id,
        },
      });

      // c. Decrement Stock & Auto-Deactivate if depleted
      for (const it of items) {
        const prodId = it.productId || it.id;
        const currentProd = await tx.product.findUnique({
          where: { id: prodId },
          select: { stock: true, name: true },
        });

        const newStock = Math.max(0, (currentProd?.stock || 0) - (it.quantity || 1));
        await tx.product.update({
          where: { id: prodId },
          data: {
            stock: newStock,
            isActive: newStock > 0, // Auto-deactivate when depleted
          },
        });
      }

      return { order, payment };
    });

    // 6. Log Audits for Compliance
    await logAuditAction({
      action: 'ORDER_CREATED',
      entityType: 'Order',
      entityId: result.order.id,
      details: `Bespoke Order ${result.order.id} placed by ${user.email} (Total: ₹${totalAmount}, Items: ${items.length})`,
      adminEmail: 'system@alankriticouture.com',
    });

    await logAuditAction({
      action: 'PAYMENT_CONFIRMED',
      entityType: 'Payment',
      entityId: result.payment.id,
      details: `Payment ${razorpay_payment_id} verified & captured for ₹${totalAmount} (Razorpay Order: ${razorpay_order_id})`,
      adminEmail: 'system@alankriticouture.com',
    });

    return NextResponse.json({
      success: true,
      order: result.order,
      payment: result.payment,
    });
  } catch (error: any) {
    console.error('Razorpay verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment settlement failed.' },
      { status: 500 }
    );
  }
}
