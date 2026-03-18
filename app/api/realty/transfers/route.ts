import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'REALTY') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { receiverEmail, documentId } = await req.json();

    if (!receiverEmail || !documentId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Find receiver
    const receiver = await prisma.user.findUnique({
      where: { email: receiverEmail },
    });

    if (!receiver) {
      return NextResponse.json({ message: 'Receiver not found' }, { status: 404 });
    }

    // Verify document belongs to sender
    const order = await prisma.order.findUnique({
      where: { readableId: documentId },
    });

    if (!order || order.customerId !== session.user.id || order.status !== 'COMPLETED') {
      return NextResponse.json({ message: 'Invalid document' }, { status: 400 });
    }

    // Create transfer request
    const transfer = await prisma.documentTransfer.create({
      data: {
        senderId: session.user.id,
        receiverId: receiver.id,
        documentId: order.readableId,
        status: 'PENDING',
      },
    });

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    console.error('Create transfer error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
