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

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ message: 'Token is required' }, { status: 400 });
    }

    const property = await prisma.property.findUnique({
      where: { transferToken: token }
    });

    if (!property) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 });
    }

    if (property.ownerId === session.user.id) {
      return NextResponse.json({ message: 'You already own this property' }, { status: 400 });
    }

    const updated = await prisma.property.update({
      where: { transferToken: token },
      data: {
        transferStatus: 'CLAIMED',
        claimedById: session.user.id
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error claiming property:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
