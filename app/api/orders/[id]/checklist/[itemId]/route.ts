import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string, itemId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'TECHNICIAN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { itemId } = await params;
  const { isCompleted } = await req.json();

  try {
    const item = await prisma.checklistItem.update({
      where: { id: itemId },
      data: { isCompleted },
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating checklist item' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string, itemId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'TECHNICIAN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { itemId } = await params;

  try {
    await prisma.checklistItem.delete({
      where: { id: itemId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting checklist item' }, { status: 500 });
  }
}
