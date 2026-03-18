import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import RealtyTransfersClient from './RealtyTransfersClient';

export default async function RealtyTransfersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'REALTY') {
    redirect('/login');
  }

  const transfers = await prisma.documentTransfer.findMany({
    where: { senderId: session.user.id },
    include: { receiver: true },
    orderBy: { createdAt: 'desc' }
  });

  const availableDocuments = await prisma.order.findMany({
    where: { customerId: session.user.id, status: 'COMPLETED' },
    orderBy: { createdAt: 'desc' }
  });

  return <RealtyTransfersClient transfers={transfers} availableDocuments={availableDocuments} />;
}
