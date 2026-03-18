import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

    const isAuthorized = 
      session.user.role === 'ADMIN' ||
      order.customerId === session.user.id ||
      order.technicianId === session.user.id ||
      order.companyId === session.user.id ||
      (session.user.role === 'COMPANY_ADMIN' && order.companyId === session.user.id);

    if (!isAuthorized) {
       // Allow if order is public and user is technician/company
       if (!order.isPublic) {
           return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
       }
    }

    const messages = await prisma.message.findMany({
      where: { orderId: id },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching messages' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { content } = await req.json();

  if (!content) {
    return NextResponse.json({ message: 'Content is required' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

    const isAuthorized = 
      session.user.role === 'ADMIN' ||
      order.customerId === session.user.id ||
      order.technicianId === session.user.id ||
      order.companyId === session.user.id ||
      (session.user.role === 'COMPANY_ADMIN' && order.companyId === session.user.id);

    if (!isAuthorized) {
       return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        orderId: id,
        senderId: session.user.id,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
      },
    });
    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ message: 'Error creating message' }, { status: 500 });
  }
}
