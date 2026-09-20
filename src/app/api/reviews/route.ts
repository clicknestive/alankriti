import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const where: any = { isApproved: true };
    if (productId) {
      where.productId = productId;
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        product: {
          select: {
            name: true,
            slug: true,
            images: {
              take: 1,
            },
          },
        },
      },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to write a review.' }, { status: 401 });
    }

    const { productId, rating, comment, imageUrl } = await request.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: 'Product, rating, and written comment are required.' }, { status: 400 });
    }

    // Verify customer has actually purchased this product in an order
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: user.id,
          paymentStatus: { in: ['PAID', 'PENDING'] },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        {
          error:
            'Only verified patrons who have purchased this specific saree can submit a review. If you recently purchased it in-boutique, please contact concierge.',
        },
        { status: 403 }
      );
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        rating: Math.min(5, Math.max(1, Number(rating))),
        comment: comment.trim(),
        imageUrl: imageUrl?.trim() || null,
        isApproved: true,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
