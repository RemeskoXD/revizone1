import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json([], { status: 401 });

    const { id } = await params;

    const photos = await prisma.orderPhoto.findMany({
      where: { orderId: id },
      select: { id: true, caption: true, uploadedBy: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Get photos error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['TECHNICIAN', 'COMPANY_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { imageData, caption } = await req.json();

    if (!imageData) {
      return NextResponse.json({ message: 'Chybí fotografie' }, { status: 400 });
    }

    const photo = await prisma.orderPhoto.create({
      data: {
        orderId: id,
        imageData,
        caption: caption || null,
        uploadedBy: session.user.id,
      },
    });

    return NextResponse.json({ id: photo.id, caption: photo.caption, createdAt: photo.createdAt }, { status: 201 });
  } catch (error) {
    console.error('Upload photo error:', error);
    return NextResponse.json({ message: 'Interní chyba' }, { status: 500 });
  }
}
