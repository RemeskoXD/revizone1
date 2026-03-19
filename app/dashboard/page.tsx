import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role === 'PRODUCT_MANAGER') {
    redirect('/product-manager');
  }

  if (session.user.role === 'ADMIN' || session.user.role === 'SUPPORT' || session.user.role === 'CONTRACTOR') {
    redirect('/admin');
  }

  if (session.user.role === 'COMPANY_ADMIN') {
    redirect('/company');
  }

  if (session.user.role === 'TECHNICIAN') {
    redirect('/technician');
  }

  if (session.user.role === 'REALTY') {
    redirect('/realty');
  }

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  const activeOrdersCount = await prisma.order.count({
    where: { customerId: session.user.id, status: { not: 'COMPLETED' } },
  });
  const completedOrdersCount = await prisma.order.count({
    where: { customerId: session.user.id, status: 'COMPLETED' },
  });

  const completedOrders = await prisma.order.findMany({
    where: { customerId: session.user.id, status: 'COMPLETED' },
    orderBy: { updatedAt: 'desc' },
  });

  let nearestExpiration: string | null = null;
  const now = new Date();
  let closestDays = Infinity;
  for (const order of completedOrders) {
    const expires = new Date(order.updatedAt);
    expires.setFullYear(expires.getFullYear() + 3);
    const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft < closestDays) {
      closestDays = daysLeft;
      nearestExpiration = expires.toLocaleDateString('cs-CZ');
    }
  }

  return (
    <DashboardClient 
      user={session.user} 
      orders={orders} 
      activeOrdersCount={activeOrdersCount} 
      completedOrdersCount={completedOrdersCount}
      nearestExpiration={nearestExpiration}
      nearestExpirationDays={closestDays === Infinity ? null : closestDays}
    />
  );
}
