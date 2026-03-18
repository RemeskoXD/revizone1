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

    const { name, fileUrl, fileType } = await req.json();

    if (!name || !fileUrl) {
      return NextResponse.json({ message: 'Name and fileUrl are required' }, { status: 400 });
    }

    const document = await prisma.productDocument.create({
      data: {
        productId,
        name,
        fileUrl,
        fileType,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Upload document error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
