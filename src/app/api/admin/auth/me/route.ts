import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ admin: null }, { status: 401 });
    }
    return NextResponse.json({ admin });
  } catch (error) {
    return NextResponse.json({ admin: null }, { status: 500 });
  }
}
