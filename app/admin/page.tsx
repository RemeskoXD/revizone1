import { StatCard } from '@/components/dashboard/StatCard';
import { Users, FileText, DollarSign, Activity, ArrowUpRight, ArrowDownRight, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AnimatedItem } from '@/components/AnimatedItem';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const completedOrders = await prisma.order.findMany({
    where: { status: 'COMPLETED' },
    select: { price: true }
  });

  const totalRevenue = completedOrders.reduce((sum, job) => sum + (job.price || 0), 0);

  const activeOrdersCount = await prisma.order.count({
    where: { status: { not: 'COMPLETED' } },
  });

  const unassignedOrdersCount = await prisma.order.count({
    where: { technicianId: null, companyId: null, status: { not: 'COMPLETED' } },
  });

  const usersCount = await prisma.user.count();

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { customer: true },
  });

  const pendingRoleRequests = await prisma.roleRequest.findMany({
    where: { status: 'PENDING' },
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-white">Přehled systému</h1>
            <p className="text-gray-400 mt-1">Globální statistiky a metriky.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedItem delay={0.1}>
          <StatCard 
              title="Celkový obrat" 
              value={`${totalRevenue.toLocaleString('cs-CZ')} Kč`} 
              description="Z dokončených zakázek"
              icon={DollarSign}
              trendUp={true}
              href="/admin/orders"
          />
        </AnimatedItem>
        <AnimatedItem delay={0.2}>
          <StatCard 
              title="Aktivní objednávky" 
              value={activeOrdersCount.toString()} 
              description={`${unassignedOrdersCount} čeká na přiřazení`}
              icon={FileText}
              alert={unassignedOrdersCount > 0}
              href="/admin/orders"
          />
        </AnimatedItem>
        <AnimatedItem delay={0.3}>
          <StatCard 
              title="Registrovaní uživatelé" 
              value={usersCount.toString()} 
              description="Celkový počet"
              icon={Users}
              href="/admin/users"
          />
        </AnimatedItem>
        <AnimatedItem delay={0.4}>
          <StatCard 
              title="Žádosti o roli" 
              value={pendingRoleRequests.length.toString()} 
              description="Čeká na schválení"
              icon={Briefcase}
              alert={pendingRoleRequests.length > 0}
              href="/admin/roles"
          />
        </AnimatedItem>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <AnimatedItem delay={0.5} className="lg:col-span-2 bg-[#111] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Poslední objednávky</h3>
                <Link href="/admin/orders" className="text-sm text-brand-yellow hover:underline">Zobrazit vše</Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-gray-500 border-b border-white/5">
                        <tr>
                            <th className="pb-3 font-medium">ID</th>
                            <th className="pb-3 font-medium">Zákazník</th>
                            <th className="pb-3 font-medium">Stav</th>
                            <th className="pb-3 font-medium text-right">Datum</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {recentOrders.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-gray-500">
                              Zatím žádné objednávky.
                            </td>
                          </tr>
                        ) : (
                          recentOrders.map((order, index) => (
                            <tr key={order.id} className="group hover:bg-white/[0.02]">
                                <td className="py-3 font-mono text-gray-500">
                                  <AnimatedItem delay={0.1 * index}>#{order.readableId}</AnimatedItem>
                                </td>
                                <td className="py-3 text-white">
                                  <AnimatedItem delay={0.1 * index}>{order.customer.name || order.customer.email}</AnimatedItem>
                                </td>
                                <td className="py-3">
                                  <AnimatedItem delay={0.1 * index}>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                        order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                                        order.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500' :
                                        order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                                        'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                        {order.status === 'COMPLETED' ? 'Dokončeno' :
                                         order.status === 'IN_PROGRESS' ? 'Probíhá' :
                                         order.status === 'CANCELLED' ? 'Zrušeno' : 'Nová'}
                                    </span>
                                  </AnimatedItem>
                                </td>
                                <td className="py-3 text-right text-gray-500">
                                  <AnimatedItem delay={0.1 * index}>{new Date(order.createdAt).toLocaleDateString('cs-CZ')}</AnimatedItem>
                                </td>
                            </tr>
                          ))
                        )}
                    </tbody>
                </table>
            </div>
        </AnimatedItem>

        {/* System Health / Alerts */}
        <AnimatedItem delay={0.6} className="bg-[#111] border border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Upozornění systému</h3>
            <div className="space-y-4">
                {pendingRoleRequests.length > 0 && (
                  <div className="flex gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="mt-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      </div>
                      <div>
                          <p className="text-sm font-medium text-yellow-500">Nové žádosti o roli</p>
                          <p className="text-xs text-gray-400 mt-1">{pendingRoleRequests.length} uživatelů žádá o změnu role.</p>
                          <Link href="/admin/roles" className="text-xs text-white underline mt-2 inline-block">Zobrazit žádosti</Link>
                      </div>
                  </div>
                )}
                
                {unassignedOrdersCount > 0 ? (
                  <div className="flex gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="mt-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                      <div>
                          <p className="text-sm font-medium text-red-500">Nepřiřazené objednávky</p>
                          <p className="text-xs text-gray-400 mt-1">{unassignedOrdersCount} objednávek čeká na přiřazení technika.</p>
                          <Link href="/admin/orders" className="text-xs text-white underline mt-2 inline-block">Vyřešit</Link>
                      </div>
                  </div>
                ) : (
                  <div className="flex gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <div>
                          <p className="text-sm font-medium text-green-500">Vše v pořádku</p>
                          <p className="text-xs text-gray-400 mt-1">Žádná upozornění nevyžadují vaši pozornost.</p>
                      </div>
                  </div>
                )}
            </div>
        </AnimatedItem>
      </div>
    </div>
  );
}
