'use client';

import Link from 'next/link';
import { FileText, Search, Filter, Download, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export default function OrdersClient({ orders }: { orders: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Moje objednávky</h1>
          <p className="text-gray-400">Přehled všech vašich revizí a jejich stavu.</p>
        </div>
        <div className="flex gap-3">
            <button className="px-4 py-2 bg-[#1A1A1A] text-white border border-white/10 rounded-lg flex items-center gap-2 hover:bg-[#252525] transition-colors">
                <Filter className="w-4 h-4" /> Filtrovat
            </button>
            <Link href="/dashboard/new-order" className="px-4 py-2 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors">
                Nová objednávka
            </Link>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
                type="text" 
                placeholder="Hledat podle ID, adresy nebo typu..." 
                className="w-full bg-[#111] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow/50 transition-colors"
            />
        </div>
        <select className="bg-[#111] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-brand-yellow/50 outline-none">
            <option value="all">Všechny stavy</option>
            <option value="pending">Čeká na vyřízení</option>
            <option value="scheduled">Naplánováno</option>
            <option value="completed">Dokončeno</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 uppercase text-xs font-semibold">
                    <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Služba</th>
                        <th className="px-6 py-4">Adresa</th>
                        <th className="px-6 py-4">Datum</th>
                        <th className="px-6 py-4">Cena</th>
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
                      orders.map((order, index) => (
                        <motion.tr 
                          key={order.id} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                            <td className="px-6 py-4 font-mono text-gray-500">#{order.readableId}</td>
                            <td className="px-6 py-4 font-medium text-white">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded bg-white/5 text-gray-400 group-hover:text-brand-yellow transition-colors">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    {order.serviceType}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-400">{order.address}</td>
                            <td className="px-6 py-4 text-gray-400">{new Date(order.createdAt).toLocaleDateString('cs-CZ')}</td>
                            <td className="px-6 py-4 text-brand-yellow">{order.price ? `${order.price.toLocaleString('cs-CZ')} Kč` : '-'}</td>
                            <td className="px-6 py-4">
                                <span className={cn(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                    order.status === 'COMPLETED' ? "bg-green-500/10 text-green-500" : 
                                    order.status === 'IN_PROGRESS' ? "bg-blue-500/10 text-blue-500" :
                                    order.status === 'CANCELLED' ? "bg-red-500/10 text-red-500" :
                                    "bg-yellow-500/10 text-yellow-500"
                                )}>
                                    {order.status === 'COMPLETED' ? 'Dokončeno' : 
                                     order.status === 'IN_PROGRESS' ? 'Probíhá' :
                                     order.status === 'CANCELLED' ? 'Zrušeno' :
                                     'Čeká'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {order.reportFile && (
                                      <a href={`/api/orders/${order.readableId}/download`} download className="p-2 text-gray-400 hover:text-brand-yellow transition-colors rounded-lg hover:bg-white/5">
                                          <Download className="w-4 h-4" />
                                      </a>
                                    )}
                                </div>
                            </td>
                        </motion.tr>
                      ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
