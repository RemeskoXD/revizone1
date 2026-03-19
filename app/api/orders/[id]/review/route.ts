import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyReviewReceived } from '@/lib/notifications';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Hodnocení musí být 1-5' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { readableId: id } });
    if (!order) return NextResponse.json({ message: 'Objednávka nenalezena' }, { status: 404 });
    if (order.customerId !== session.user.id) return NextResponse.json({ message: 'Nemáte oprávnění' }, { status: 403 });
    if (order.status !== 'COMPLETED') return NextResponse.json({ message: 'Objednávka není dokončena' }, { status: 400 });
    if (!order.technicianId) return NextResponse.json({ message: 'Objednávka nemá technika' }, { status: 400 });

    const existing = await prisma.review.findUnique({ where: { orderId: order.id } });
    if (existing) return NextResponse.json({ message: 'Již jste hodnotili' }, { status: 400 });

    const review = await prisma.review.create({
      data: {
        orderId: order.id,
        customerId: session.user.id,
        technicianId: order.technicianId,
        rating,
        comment: comment || null,
      },
    });

    await notifyReviewReceived(order.technicianId, rating, order.readableId);

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json({ message: 'Interní chyba' }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { readableId: id } });
    if (!order) return NextResponse.json(null);

    const review = await prisma.review.findUnique({
      where: { orderId: order.id },
      include: { customer: { select: { name: true } } },
    });

    return NextResponse.json(review);
  } catch {
    return NextResponse.json(null);
  }
}
