import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import RevisionsClient from './RevisionsClient';

export default async function RevisionsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
    redirect('/login');
  }

  const categories = await prisma.revisionCategory.findMany({
    orderBy: [{ group: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { orders: true } },
    },
  });

  return <RevisionsClient categories={categories} isAdmin={session.user.role === 'ADMIN'} />;
}
