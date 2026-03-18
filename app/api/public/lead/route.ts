import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address, name, email, phone, serviceType, termsAccepted } = body;

    if (!address || !name || !email || !phone || !termsAccepted) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create a new user (customer) if they don't exist
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          role: 'CUSTOMER'
        }
      });
    }

    // Create the order/lead
    // Generate a readable ID
    const count = await prisma.order.count();
    const readableId = `LEAD-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const order = await prisma.order.create({
      data: {
        readableId,
        customerId: user.id,
        serviceType: serviceType || 'Bezplatná kontrola oken u vás doma',
        propertyType: 'Nezadáno',
        address,
        status: 'PENDING',
        isPublic: true // Make it public so companies can claim it
      }
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('Lead creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
