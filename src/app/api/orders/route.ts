import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateOrderId } from '@/lib/utils';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        payment: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let user = await getCurrentUser();
    const body = await request.json();

    const {
      customerData,
      addressData,
      items,
      totalAmount,
      discountAmount = 0,
      shippingAmount = 0,
      paymentMethod = 'RAZORPAY',
      paymentStatus = 'PAID',
      razorpayOrderId,
      razorpayPaymentId,
      customerNotes,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cannot create order with an empty bag.' }, { status: 400 });
    }

    // 1. Concurrency Stock Check to Prevent Overselling
    for (const it of items) {
      const prodId = it.productId || it.id;
      const product = await prisma.product.findUnique({
        where: { id: prodId },
        select: { id: true, name: true, stock: true, isActive: true },
      });

      if (!product || !product.isActive || product.stock < (it.quantity || 1)) {
        return NextResponse.json(
          {
            error: `"${product?.name || 'Selected item'}" has insufficient stock (${product?.stock || 0} remaining). Please review your shopping bag.`,
          },
          { status: 409 }
        );
      }
    }

    // 2. User Resolution
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
      return NextResponse.json({ error: 'Customer identification is required.' }, { status: 400 });
    }

    const orderId = generateOrderId();
    const orderStatus = paymentStatus === 'PAID' ? 'PAYMENT CONFIRMED' : 'ORDER PLACED';

    const shippingAddressSnapshot = JSON.stringify({
      fullName: addressData?.fullName || customerData?.name || user.name,
      phone: addressData?.phone || customerData?.mobile || user.mobile || '',
      street: addressData?.street || '',
      landmark: addressData?.landmark || '',
      city: addressData?.city || '',
      state: addressData?.state || '',
      pincode: addressData?.pincode || '',
    });

    const finalRazorpayOrderId = razorpayOrderId || `rzp_ord_${Date.now()}`;
    const finalRazorpayPaymentId = razorpayPaymentId || `rzp_pay_${Date.now()}`;

    // 3. Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          id: orderId,
          userId: user!.id,
          totalAmount: Number(totalAmount),
          discountAmount: Number(discountAmount),
          shippingAmount: Number(shippingAmount),
          paymentStatus,
          orderStatus,
          paymentMethod,
          razorpayOrderId: finalRazorpayOrderId,
          razorpayPaymentId: paymentStatus === 'PAID' ? finalRazorpayPaymentId : null,
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

      // Create Payment record
      const payment = await tx.payment.create({
        data: {
          paymentId: paymentStatus === 'PAID' ? finalRazorpayPaymentId : null,
          razorpayOrderId: finalRazorpayOrderId,
          amount: Number(totalAmount),
          currency: 'INR',
          status: paymentStatus === 'PAID' ? 'CAPTURED' : 'CREATED',
          method: paymentMethod,
          userId: user!.id,
          orderId: order.id,
        },
      });

      // Decrement stock & auto-deactivate if stock hits 0
      for (const it of items) {
        const prodId = it.productId || it.id;
        const currentProd = await tx.product.findUnique({
          where: { id: prodId },
          select: { stock: true },
        });

        const newStock = Math.max(0, (currentProd?.stock || 0) - (it.quantity || 1));
        await tx.product.update({
          where: { id: prodId },
          data: {
            stock: newStock,
            isActive: newStock > 0,
          },
        });
      }

      return { order, payment };
    });

    // 4. Audit Logging
    await logAuditAction({
      action: 'ORDER_CREATED',
      entityType: 'Order',
      entityId: result.order.id,
      details: `Order ${result.order.id} placed by ${user.email} (Method: ${paymentMethod}, Status: ${orderStatus})`,
      adminEmail: user.email,
    });

    return NextResponse.json({
      success: true,
      order: result.order,
      payment: result.payment,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}
