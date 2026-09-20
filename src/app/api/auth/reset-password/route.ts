import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
    }

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Reset token is invalid or has expired.' }, { status: 400 });
    }

    const passwordHash = hashPassword(newPassword);

    await prisma.user.update({
      where: { email: resetRecord.email },
      data: { passwordHash },
    });

    await prisma.passwordResetToken.delete({
      where: { token },
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully. You may now login.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 });
  }
}
