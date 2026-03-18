import { StatCard } from '@/components/dashboard/StatCard';
import { AlertTriangle, Calendar, CheckCircle2, Clock, FileText, ArrowRight, Check, X } from 'lucide-react';
import Link from 'next/link';
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

  if (session.user.role === 'ADMIN') {
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

  const pendingTransfers = await prisma.documentTransfer.findMany({
    where: { receiverId: session.user.id, status: 'PENDING' },
    include: { sender: true }
  });

  return (
    <DashboardClient 
      user={session.user} 
      orders={orders} 
      activeOrdersCount={activeOrdersCount} 
      completedOrdersCount={completedOrdersCount} 
      pendingTransfers={pendingTransfers} 
    />
  );
}
