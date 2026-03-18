'use client';

import { ShieldCheck, FileText, Download, Search, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export default function VaultClient({ completedOrders }: { completedOrders: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Trezor revizí</h1>
          <p className="text-gray-400">Bezpečné úložiště všech vašich revizních zpráv a dokumentů.</p>
        </div>
      </div>

      {/* Stats / Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-brand-yellow/20 to-brand-yellow/5 border border-brand-yellow/20 rounded-xl p-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-yellow text-black rounded-lg">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-brand-yellow font-medium">Všechny revize platné</p>
                    <p className="text-sm text-brand-yellow/70">Žádná revize neexpirovala</p>
                </div>
            </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {completedOrders.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[#1A1A1A] border border-white/5 rounded-xl">
            <p className="text-gray-500">Zatím nemáte žádné dokončené revize.</p>
          </div>
        ) : (
          completedOrders.map((order, index) => {
            const date = new Date(order.updatedAt);
            const expires = new Date(date);
            expires.setFullYear(expires.getFullYear() + 3); // Example: 3 years validity

            return (
              <motion.div 
                key={order.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group bg-[#1A1A1A] border border-white/5 hover:border-brand-yellow/50 rounded-xl p-5 transition-all hover:shadow-lg hover:shadow-brand-yellow/5 flex flex-col"
              >
                  <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-white/5 rounded-lg group-hover:bg-brand-yellow group-hover:text-black transition-colors text-gray-400">
                          <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono text-gray-500 bg-black/20 px-2 py-1 rounded">PDF</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-brand-yellow transition-colors">Revizní zpráva - {order.serviceType}</h3>
                  <div className="space-y-2 mt-4 flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>Vydáno: {date.toLocaleDateString('cs-CZ')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Platnost do: <span className="text-green-500">{expires.toLocaleDateString('cs-CZ')}</span></span>
                      </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {order.reportFile ? 'Dostupné' : 'Zatím nenahráno'}
                      </span>
                      {order.reportFile ? (
                        <a href={`/api/orders/${order.readableId}/download`} download className="flex items-center gap-2 text-sm font-medium text-white hover:text-brand-yellow transition-colors">
                            <Download className="w-4 h-4" /> Stáhnout
                        </a>
                      ) : (
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <Download className="w-4 h-4" /> Nedostupné
                        </span>
                      )}
                  </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
