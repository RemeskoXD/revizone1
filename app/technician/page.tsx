import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { checkAndReleaseExpiredOrders } from '@/lib/orderUtils';
import TechnicianDashboardClient from './TechnicianDashboardClient';

export default async function TechnicianDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'TECHNICIAN') {
    redirect('/login');
  }

  await checkAndReleaseExpiredOrders();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const openJobsCount = await prisma.order.count({
    where: { technicianId: session.user.id, status: { in: ['PENDING', 'IN_PROGRESS'] } },
  });

  const completedJobsCount = await prisma.order.count({
    where: { technicianId: session.user.id, status: 'COMPLETED' },
  });

  const activeJobs = await prisma.order.findMany({
    where: { technicianId: session.user.id, status: { in: ['PENDING', 'IN_PROGRESS'] } },
    select: { price: true }
  });

  const expectedEarnings = activeJobs.reduce((sum, job) => sum + (job.price || 0), 0);

  const newRequestsCount = await prisma.order.count({
    where: { isPublic: true, status: 'PENDING' },
  });

  const newRequests = await prisma.order.findMany({
    where: { isPublic: true, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const todaysJobs = await prisma.order.findMany({
    where: { technicianId: session.user.id, status: { in: ['PENDING', 'IN_PROGRESS'] } },
    orderBy: { createdAt: 'asc' },
    take: 3,
  });

  return (
    <TechnicianDashboardClient 
      user={user}
      newRequestsCount={newRequestsCount}
      openJobsCount={openJobsCount}
      completedJobsCount={completedJobsCount}
      expectedEarnings={expectedEarnings}
      newRequests={newRequests}
      todaysJobs={todaysJobs}
    />
  );
}
