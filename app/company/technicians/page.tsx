import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CompanyTechniciansClient from './CompanyTechniciansClient';

export default async function CompanyTechniciansPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'COMPANY_ADMIN') {
    redirect('/login');
  }

  const technicians = await prisma.user.findMany({
    where: {
      companyId: session.user.id,
      role: 'TECHNICIAN'
    },
    include: {
      assignedOrders: {
        where: { status: { in: ['PENDING', 'IN_PROGRESS'] } }
      }
    },
    orderBy: { name: 'asc' }
  });

  return <CompanyTechniciansClient technicians={technicians} companyCode={session.user.id} />;
}
