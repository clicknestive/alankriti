import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from './prisma';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'alankriti-admin-secret-key-2026-high-security-vault';

export interface AdminPayload {
  adminId: string;
  email: string;
  name: string;
  role: string;
}

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, ADMIN_JWT_SECRET, { expiresIn: '12h' });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as AdminPayload;
    if (decoded.role !== 'ADMIN') return null;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getAdminSession() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('alc_admin_token')?.value;
    if (!token) return null;

    const payload = verifyAdminToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.adminId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlocked: true,
        createdAt: true,
      },
    });

    if (!user || user.role !== 'ADMIN' || user.isBlocked) {
      return null;
    }

    return user;
  } catch (err) {
    console.error('Error fetching admin session:', err);
    return null;
  }
}
