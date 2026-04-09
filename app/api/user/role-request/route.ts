import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { requestedRole } = await req.json();

    if (!['TECHNICIAN', 'COMPANY_ADMIN', 'REALTY', 'SVJ', 'PRODUCT_MANAGER'].includes(requestedRole)) {
      return NextResponse.json({ message: 'Invalid role requested' }, { status: 400 });
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.roleRequest.findFirst({
      where: {
        userId: session.user.id,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return NextResponse.json({ message: 'You already have a pending role request' }, { status: 400 });
    }

    const roleRequest = await prisma.roleRequest.create({
      data: {
        userId: session.user.id,
        requestedRole,
      },
    });

    return NextResponse.json({ message: 'Role request created successfully', roleRequest }, { status: 201 });
  } catch (error) {
    console.error('Role request error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
