import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'REALTY') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: propertyId } = await params;

    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property || property.ownerId !== session.user.id) {
      return NextResponse.json({ message: 'Property not found or unauthorized' }, { status: 404 });
    }

    const { serviceType, propertyType, notes, preferredDate, address } = await req.json();

    // Generate readable ID
    const count = await prisma.order.count();
    const readableId = `ORD-${new Date().getFullYear()}-${(count + 1).toString().padStart(3, '0')}`;

    const order = await prisma.order.create({
      data: {
        readableId,
        customerId: session.user.id,
        propertyId: property.id,
        serviceType,
        propertyType: propertyType || 'Byt',
        address: address || property.address || property.name,
        notes,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
