import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readJsonBody, PayloadTooLargeError } from '@/lib/json-body';
import { rateLimit } from '@/lib/rate-limit';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json([], { status: 401 });

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const rl = rateLimit(`notif-patch:${session.user.id}`, 120, 60 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { message: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
      );
    }

    const body = await readJsonBody<{ action?: string; notificationId?: string }>(req, 8192);
    const { action, notificationId } = body;

    if (action === 'read_all') {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ message: 'All marked as read' });
    }

    if (action === 'read' && notificationId) {
      const nid = String(notificationId).slice(0, 80);
      const notification = await prisma.notification.findUnique({
        where: { id: nid },
        select: { userId: true },
      });
      if (!notification || notification.userId !== session.user.id) {
        return NextResponse.json({ message: 'Not found' }, { status: 404 });
      }
      await prisma.notification.update({
        where: { id: nid },
        data: { isRead: true },
      });
      return NextResponse.json({ message: 'Marked as read' });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return NextResponse.json({ message: 'Payload too large' }, { status: 413 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
    }
    console.error('Update notifications error:', error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}
