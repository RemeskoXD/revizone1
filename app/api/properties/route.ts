import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['REALTY', 'SVJ'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, address, description } = await req.json();

    if (!name) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const property = await prisma.property.create({
      data: {
        name,
        address,
        description,
        ownerId: session.user.id,
      },
      include: {
        orders: true,
        claimedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
