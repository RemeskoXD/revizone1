'use client';

import { StatCard } from '@/components/dashboard/StatCard';
import { AlertTriangle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { AnimatedItem } from '@/components/AnimatedItem';

export default function DashboardClient({ user, orders, activeOrdersCount, completedOrdersCount }: any) {
  const router = useRouter();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-white">Vítejte zpět, {user.name?.split(' ')[0] || 'uživateli'} 👋</h1>
            <p className="text-gray-400 mt-1">Zde je přehled vašich revizí a termínů.</p>
        </div>
        <div className="flex gap-3">
            <Link href="/dashboard/vault" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl border border-white/10 transition-colors">
                Přejít do trezoru
            </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedItem delay={0.1}>
          <StatCard 
              title="Nejbližší expirace" 
              value="N/A" 
              description="Zatím žádné expirující revize"
              icon={AlertTriangle}
              alert={false}
          />
        </AnimatedItem>
        <AnimatedItem delay={0.2}>
          <StatCard 
              title="Aktivní objednávky" 
              value={activeOrdersCount.toString()} 
              description="Čeká na vyřízení"
              icon={Clock}
          />
        </AnimatedItem>
        <AnimatedItem delay={0.3}>
          <StatCard 
              title="Dokončené revize" 
              value={completedOrdersCount.toString()} 
              description="Všechny dokumenty v pořádku"
              icon={CheckCircle2}
          />
        </AnimatedItem>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-white">Nedávné aktivity</h2>
            <Link href="/dashboard/orders" className="text-sm text-brand-yellow hover:text-brand-yellow-hover font-semibold flex items-center gap-1 transition-colors">
                Zobrazit vše <ArrowRight className="w-4 h-4" />
            </Link>
        </div>

        <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/[0.02] text-gray-400 uppercase text-xs font-semibold tracking-wider border-b border-white/5">
                        <tr>
                            <th className="px-6 py-5">ID Objednávky</th>
                            <th className="px-6 py-5">Typ služby</th>
                            <th className="px-6 py-5">Adresa</th>
                            <th className="px-6 py-5">Cena</th>
                            <th className="px-6 py-5">Datum</th>
                            <th className="px-6 py-5">Stav</th>
                            <th className="px-6 py-5 text-right">Akce</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                              <div className="flex flex-col items-center justify-center">
                                <Clock className="w-8 h-8 text-gray-600 mb-3" />
                                <p>Zatím nemáte žádné objednávky.</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          orders.map((order: any, index: number) => (
                            <motion.tr 
                                key={order.id} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="hover:bg-white/[0.02] transition-colors"
                            >
                                <td className="px-6 py-4 font-mono text-gray-500">#{order.readableId}</td>
                                <td className="px-6 py-4 font-bold text-white">{order.serviceType}</td>
                                <td className="px-6 py-4 text-gray-400">{order.address}</td>
                                <td className="px-6 py-4 text-brand-yellow font-medium">{order.price ? `${order.price.toLocaleString('cs-CZ')} Kč` : '-'}</td>
                                <td className="px-6 py-4 text-gray-400">{new Date(order.createdAt).toLocaleDateString('cs-CZ')}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                      order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                      order.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                      order.status === 'NEEDS_REVISION' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                                      order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                      'bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20'
                                    }`}>
                                        {order.status === 'COMPLETED' ? 'Dokončeno' :
                                         order.status === 'IN_PROGRESS' ? 'Probíhá' :
                                         order.status === 'NEEDS_REVISION' ? 'K přepracování' :
                                         order.status === 'CANCELLED' ? 'Zrušeno' : 'Čeká'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={`/dashboard/orders/${order.readableId}`} className="text-gray-400 hover:text-white font-medium transition-colors">Detail</Link>
                                </td>
                            </motion.tr>
                          ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}
