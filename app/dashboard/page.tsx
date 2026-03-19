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

  let orders;
  let activeOrdersCount;
  let completedOrdersCount;

  // Only CUSTOMER role should reach here
  orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  activeOrdersCount = await prisma.order.count({
    where: { customerId: session.user.id, status: { not: 'COMPLETED' } },
  });
  completedOrdersCount = await prisma.order.count({
    where: { customerId: session.user.id, status: 'COMPLETED' },
  });

  return (
    <DashboardClient 
      user={session.user} 
      orders={orders} 
      activeOrdersCount={activeOrdersCount} 
      completedOrdersCount={completedOrdersCount} 
    />
  );
}
