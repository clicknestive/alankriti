import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = rateLimit({ key: `forgot_pass_${ip}`, limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many password reset attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Return success to avoid email enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a password reset link has been dispatched.',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset link dispatched.',
      resetToken: token, // Sent for demo convenience
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error processing request.' }, { status: 500 });
  }
}
