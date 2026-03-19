import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminUsersClient from './AdminUsersClient';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
    redirect('/login');
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Správa uživatelů</h1>
          <p className="text-gray-400">Přehled všech registrovaných zákazníků a techniků.</p>
        </div>
      </div>

      <AdminUsersClient initialUsers={users} userRole={session.user.role} />
    </div>
  );
}
