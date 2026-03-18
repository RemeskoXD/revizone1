import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only PRODUCT_MANAGER can list their products
    if (session.user.role !== 'PRODUCT_MANAGER') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      where: { managerId: session.user.id },
      include: {
        documents: true,
        shares: {
          include: {
            customer: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'PRODUCT_MANAGER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, code, description } = await req.json();

    if (!name) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        code,
        description,
        managerId: session.user.id,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
