import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendOrderStatusEmail } from '@/lib/notifications';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { token } = await req.json();

    const order = await prisma.order.findUnique({
      where: { readableId: id },
    });

    if (!order) {
      return NextResponse.json({ message: 'Objednávka nenalezena' }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const isOwner = session && order.customerId === session.user.id;
    const isValidToken = token && order.cancelToken === token;

    if (!isOwner && !isValidToken) {
      return NextResponse.json({ message: 'Neautorizovaný přístup' }, { status: 403 });
    }

    if (['COMPLETED', 'CANCELLED'].includes(order.status)) {
      return NextResponse.json({
        message: order.status === 'COMPLETED'
          ? 'Dokončenou objednávku nelze zrušit'
          : 'Objednávka je již zrušena',
      }, { status: 400 });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    });

    sendOrderStatusEmail(order.id, 'CANCELLED').catch(console.error);

    await prisma.activityLog.create({
      data: {
        userId: session?.user?.id || order.customerId,
        action: 'ORDER_CANCELLED',
        details: `Objednávka #${order.readableId} zrušena ${isValidToken ? 'přes e-mailový odkaz' : 'zákazníkem'}`,
        targetId: order.id,
      },
    });

    return NextResponse.json({ message: 'Objednávka byla zrušena' });
  } catch (error) {
    console.error('Cancel order error:', error);
    return NextResponse.json({ message: 'Interní chyba serveru' }, { status: 500 });
  }
}
