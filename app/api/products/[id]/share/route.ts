import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'PRODUCT_MANAGER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: productId } = await params;

    // Verify ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.managerId !== session.user.id) {
      return NextResponse.json({ message: 'Product not found or unauthorized' }, { status: 404 });
    }

    const { customerEmail } = await req.json();

    if (!customerEmail) {
      return NextResponse.json({ message: 'Customer email is required' }, { status: 400 });
    }

    // Find the customer by email
    const customer = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!customer || customer.role !== 'CUSTOMER') {
      return NextResponse.json({ message: 'Customer not found or invalid role' }, { status: 404 });
    }

    // Check if already shared
    const existingShare = await prisma.productShare.findUnique({
      where: {
        productId_customerId: {
          productId,
          customerId: customer.id,
        },
      },
    });

    if (existingShare) {
      return NextResponse.json({ message: 'Product already shared with this customer' }, { status: 400 });
    }

    const share = await prisma.productShare.create({
      data: {
        productId,
        customerId: customer.id,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(share, { status: 201 });
  } catch (error) {
    console.error('Share product error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
