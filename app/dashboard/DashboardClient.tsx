'use client';

import { useState } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { AlertTriangle, Calendar, CheckCircle2, Clock, FileText, ArrowRight, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { AnimatedItem } from '@/components/AnimatedItem';

export default function DashboardClient({ user, orders, activeOrdersCount, completedOrdersCount, pendingTransfers }: any) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const router = useRouter();

  const handleTransferAction = async (transferId: string, action: 'ACCEPT' | 'REJECT') => {
    setIsProcessing(transferId);
    try {
      const res = await fetch(`/api/user/transfers/${transferId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        alert(action === 'ACCEPT' ? 'Dokument byl úspěšně přijat.' : 'Převod dokumentu byl zamítnut.');
        router.refresh();
      } else {
        alert('Došlo k chybě při zpracování převodu.');
      }
    } catch (error) {
      console.error(error);
      alert('Došlo k chybě při zpracování převodu.');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-white">Vítejte zpět, {user.name?.split(' ')[0] || 'uživateli'} 👋</h1>
            <p className="text-gray-400 mt-1">Zde je přehled vašich revizí a termínů.</p>
        </div>
        <div className="flex gap-3">
            <Link href="/dashboard/vault" className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#252525] text-white text-sm font-medium rounded-lg border border-white/10 transition-colors">
                Přejít do trezoru
            </Link>
        </div>
      </div>

      {/* Pending Transfers Alert */}
      {pendingTransfers.length > 0 && (
        <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-brand-yellow mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" /> Čekající převody dokumentů ({pendingTransfers.length})
          </h3>
          <div className="space-y-3">
            {pendingTransfers.map((transfer: any) => (
              <div key={transfer.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1A1A1A] p-4 rounded-lg border border-white/5">
                <div>
                  <p className="text-white font-medium">Dokument #{transfer.documentId}</p>
                  <p className="text-sm text-gray-400">Odesílatel: {transfer.sender.name || transfer.sender.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTransferAction(transfer.id, 'ACCEPT')}
                    disabled={isProcessing === transfer.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" /> Přijmout
                  </button>
                  <button
                    onClick={() => handleTransferAction(transfer.id, 'REJECT')}
                    disabled={isProcessing === transfer.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    <X className="w-4 h-4" /> Zamítnout
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Nedávné aktivity</h2>
            <Link href="/dashboard/orders" className="text-sm text-brand-yellow hover:text-brand-yellow-hover flex items-center gap-1 transition-colors">
                Zobrazit vše <ArrowRight className="w-4 h-4" />
            </Link>
        </div>

        <div className="bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-gray-400 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">ID Objednávky</th>
                            <th className="px-6 py-4">Typ služby</th>
                            <th className="px-6 py-4">Adresa</th>
                            <th className="px-6 py-4">Cena</th>
                            <th className="px-6 py-4">Datum</th>
                            <th className="px-6 py-4">Stav</th>
                            <th className="px-6 py-4 text-right">Akce</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                              Zatím nemáte žádné objednávky.
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
                                <td className="px-6 py-4 font-medium text-white">{order.serviceType}</td>
                                <td className="px-6 py-4 text-gray-400">{order.address}</td>
                                <td className="px-6 py-4 text-brand-yellow">{order.price ? `${order.price.toLocaleString('cs-CZ')} Kč` : '-'}</td>
                                <td className="px-6 py-4 text-gray-400">{new Date(order.createdAt).toLocaleDateString('cs-CZ')}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                                      order.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500' :
                                      order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                                      'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                        {order.status === 'COMPLETED' ? 'Dokončeno' :
                                         order.status === 'IN_PROGRESS' ? 'Probíhá' :
                                         order.status === 'CANCELLED' ? 'Zrušeno' : 'Čeká'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={`/dashboard/orders/${order.readableId}`} className="text-gray-400 hover:text-white transition-colors">Detail</Link>
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
