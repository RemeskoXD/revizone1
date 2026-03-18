import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const items = await prisma.checklistItem.findMany({
      where: { orderId: id },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching checklist' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'TECHNICIAN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ message: 'Text is required' }, { status: 400 });
  }

  try {
    const item = await prisma.checklistItem.create({
      data: {
        orderId: id,
        text,
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ message: 'Error creating checklist item' }, { status: 500 });
  }
}
