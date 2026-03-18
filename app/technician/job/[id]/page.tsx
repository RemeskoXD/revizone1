import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import JobDetailClient from './JobDetailClient';

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'TECHNICIAN') {
    redirect('/login');
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { readableId: id },
    include: {
      customer: true,
      technician: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Ensure the technician is assigned to this order or it's public
  if (order.technicianId !== session.user.id && !order.isPublic) {
    redirect('/technician/queue');
  }

  return <JobDetailClient order={order} currentUser={session.user} />;
}
