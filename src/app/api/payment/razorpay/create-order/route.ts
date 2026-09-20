import { NextResponse } from 'next/server';
import { createRazorpayOrder, getRazorpayKeyId } from '@/lib/razorpay';
import { generateOrderId } from '@/lib/utils';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { amount, items } = await request.json();

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Valid payment amount is required.' }, { status: 400 });
    }

    // 1. Stock Check & Overselling Prevention
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId || item.id },
          select: { id: true, name: true, stock: true, isActive: true },
        });

        if (!product) {
          return NextResponse.json(
            { error: `Product "${item.name || 'Selected item'}" is no longer available.` },
            { status: 400 }
          );
        }

        if (!product.isActive || product.stock <= 0) {
          return NextResponse.json(
            { error: `"${product.name}" is completely sold out.` },
            { status: 400 }
          );
        }

        const requestedQty = item.quantity || 1;
        if (product.stock < requestedQty) {
          return NextResponse.json(
            {
              error: `Only ${product.stock} unit(s) of "${product.name}" remaining in inventory. Please adjust your bag.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // 2. Generate Razorpay Order
    const receipt = generateOrderId();
    const order = await createRazorpayOrder({
      amount,
      receipt,
      notes: {
        boutique: 'ALANKRITI COUTURE',
        purpose: 'Handcrafted Heritage Saree Order',
      },
    });

    return NextResponse.json({
      ...order,
      key_id: getRazorpayKeyId(),
      receipt,
    });
  } catch (error) {
    console.error('Razorpay initialization error:', error);
    return NextResponse.json({ error: 'Failed to initiate payment gateway.' }, { status: 500 });
  }
}
