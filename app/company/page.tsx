import { StatCard } from '@/components/dashboard/StatCard';
import { Users, FileText, Activity, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { checkAndReleaseExpiredOrders } from '@/lib/orderUtils';
import { AnimatedItem } from '@/components/AnimatedItem';

export default async function CompanyDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'COMPANY_ADMIN') {
    redirect('/login');
  }

  await checkAndReleaseExpiredOrders();

  const techniciansCount = await prisma.user.count({
    where: { companyId: session.user.id, role: 'TECHNICIAN' },
  });

  const activeOrdersCount = await prisma.order.count({
    where: { companyId: session.user.id, status: { not: 'COMPLETED' } },
  });

  const activeOrders = await prisma.order.findMany({
    where: { companyId: session.user.id, status: { in: ['PENDING', 'IN_PROGRESS'] } },
    select: { price: true }
  });

  const expectedEarnings = activeOrders.reduce((sum, job) => sum + (job.price || 0), 0);

  const unassignedOrdersCount = await prisma.order.count({
    where: { companyId: session.user.id, technicianId: null, status: { not: 'COMPLETED' } },
  });

  const recentOrders = await prisma.order.findMany({
    where: { companyId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { customer: true, technician: true },
  });

  const newRequestsCount = await prisma.order.count({
    where: { isPublic: true, status: 'PENDING' },
  });

  const newRequests = await prisma.order.findMany({
    where: { isPublic: true, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-white">Firemní přehled</h1>
            <p className="text-gray-400 mt-1">Vítejte, {session.user.name}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedItem delay={0.1}>
          <StatCard 
              title="Aktivní zakázky" 
              value={activeOrdersCount.toString()} 
              description={`${unassignedOrdersCount} čeká na přidělení technikovi`}
              icon={FileText}
              alert={unassignedOrdersCount > 0}
              href="/company/orders"
          />
        </AnimatedItem>
        <AnimatedItem delay={0.2}>
          <StatCard 
              title="Vaši technici" 
              value={techniciansCount.toString()} 
              description="Celkový počet"
              icon={Users}
              href="/company/technicians"
          />
        </AnimatedItem>
        <AnimatedItem delay={0.3}>
          <StatCard 
              title="Očekávaný výdělek" 
              value={`${expectedEarnings.toLocaleString('cs-CZ')} Kč`} 
              description="Z aktivních zakázek"
              icon={DollarSign}
              href="/company/orders"
          />
        </AnimatedItem>
        <AnimatedItem delay={0.4}>
          <StatCard 
              title="Nové poptávky" 
              value={newRequestsCount.toString()} 
              description="Dostupné pro všechny"
              icon={FileText}
              href="/company/orders"
          />
        </AnimatedItem>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <AnimatedItem delay={0.4} className="lg:col-span-2 bg-[#111] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Poslední zakázky</h3>
                <Link href="/company/orders" className="text-sm text-brand-yellow hover:underline">Zobrazit vše</Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-gray-500 border-b border-white/5">
                        <tr>
                            <th className="pb-3 font-medium">ID</th>
                            <th className="pb-3 font-medium">Zákazník</th>
                            <th className="pb-3 font-medium">Technik</th>
                            <th className="pb-3 font-medium">Stav</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {recentOrders.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-gray-500">
                              Zatím žádné zakázky.
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
                                <td className="py-3 text-gray-400">
                                  <AnimatedItem delay={0.1 * index}>{order.technician?.name || 'Nepřiřazeno'}</AnimatedItem>
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
                            </tr>
                          ))
                        )}
                    </tbody>
                </table>
            </div>
        </AnimatedItem>

        {/* System Health / Alerts */}
        <AnimatedItem delay={0.5} className="bg-[#111] border border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Upozornění</h3>
            <div className="space-y-4">
                {unassignedOrdersCount > 0 ? (
                  <div className="flex gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="mt-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                      <div>
                          <p className="text-sm font-medium text-red-500">Nepřiřazené zakázky</p>
                          <p className="text-xs text-gray-400 mt-1">{unassignedOrdersCount} zakázek čeká na přiřazení technikovi. Máte 1 den na přijetí.</p>
                          <Link href="/company/orders" className="text-xs text-white underline mt-2 inline-block">Vyřešit</Link>
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
