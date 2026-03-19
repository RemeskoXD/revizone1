import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { orderIds, label, expiresInDays } = await req.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ message: 'Vyberte alespoň jednu revizi' }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds }, customerId: session.user.id, status: 'COMPLETED' },
      select: { id: true },
    });

    if (orders.length === 0) {
      return NextResponse.json({ message: 'Žádné platné revize k sdílení' }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null;

    const shareLink = await prisma.shareLink.create({
      data: {
        token,
        userId: session.user.id,
        label: label || null,
        orderIds: JSON.stringify(orders.map(o => o.id)),
        expiresAt,
      },
    });

    return NextResponse.json({ token: shareLink.token, url: `/share/${shareLink.token}` });
  } catch (error) {
    console.error('Create share link error:', error);
    return NextResponse.json({ message: 'Interní chyba' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json([], { status: 401 });

    const links = await prisma.shareLink.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error('Get share links error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
