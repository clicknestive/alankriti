import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyPassword, hashPassword } from '@/lib/auth';
import { signAdminToken } from '@/lib/adminAuth';
import { logAuditAction } from '@/lib/audit';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = rateLimit({ key: `admin_login_${ip}`, limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rateCheck.success) {
      await logAuditAction({
        action: 'ADMIN_LOGIN_RATE_LIMITED',
        entityType: 'Auth',
        details: `IP ${ip} exceeded maximum admin login attempts`,
        adminEmail: 'security@alankriticouture.com',
      });
      return NextResponse.json(
        { error: 'Too many administrative login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const username = body.username || body.email;
    const password = body.password;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username/Email and Password are required.' }, { status: 400 });
    }

    const normalizedEmail = username.toLowerCase().trim();

    let admin = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Check against configured environment variables if not present in DB
    const envAdminEmail = (process.env.ADMIN_USERNAME || 'admin@alankriticouture.com').toLowerCase().trim();
    const envAdminPass = process.env.ADMIN_PASSWORD || 'AlankritiAdmin@2026';

    if (!admin && normalizedEmail === envAdminEmail) {
      const passwordHash = hashPassword(envAdminPass);
      admin = await prisma.user.create({
        data: {
          name: 'Alankriti Principal Administrator',
          email: envAdminEmail,
          passwordHash,
          role: 'ADMIN',
        },
      });
    }

    if (!admin) {
      return NextResponse.json({ error: 'Invalid administrative credentials.' }, { status: 401 });
    }

    if (admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied. Administrator privileges required.' }, { status: 403 });
    }

    if (admin.isBlocked) {
      return NextResponse.json({ error: 'This administrative account is disabled.' }, { status: 403 });
    }

    const isValid = verifyPassword(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid administrative credentials.' }, { status: 401 });
    }

    const token = signAdminToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'ADMIN',
    });

    cookies().set('alc_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60, // 12 hours
      path: '/',
    });

    await logAuditAction({
      action: 'ADMIN_LOGIN',
      entityType: 'Auth',
      entityId: admin.id,
      details: `Administrator "${admin.name}" successfully authenticated`,
      adminEmail: admin.email,
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error during administrative authentication.' }, { status: 500 });
  }
}
