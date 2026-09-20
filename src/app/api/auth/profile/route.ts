import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, mobile, profilePhoto } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? name.trim() : user.name,
        mobile: mobile !== undefined ? mobile.trim() : user.mobile,
        profilePhoto: profilePhoto !== undefined ? profilePhoto : user.profilePhoto,
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        profilePhoto: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
