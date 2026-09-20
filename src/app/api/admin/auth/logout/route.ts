import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  cookies().delete('alc_admin_token');
  return NextResponse.json({ success: true, message: 'Admin session terminated.' });
}
