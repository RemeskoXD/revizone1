'use client';

import { Activity } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminHistoryClient({ logs }: { logs: any[] }) {
  return (
    <div className="bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-400 uppercase text-xs font-semibold">
                  <tr>
                      <th className="px-6 py-4">Datum</th>
                      <th className="px-6 py-4">Uživatel</th>
                      <th className="px-6 py-4">Akce</th>
                      <th className="px-6 py-4">Detaily</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Zatím žádná historie.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, index) => (
                      <motion.tr 
                        key={log.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                          <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString('cs-CZ')}
                          </td>
                          <td className="px-6 py-4">
                              <div className="font-medium text-white">{log.user.name || log.user.email}</div>
                              <div className="text-xs text-gray-500">{log.user.role}</div>
                          </td>
                          <td className="px-6 py-4 text-brand-yellow font-medium">
                            {log.action}
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {log.details || '-'}
                          </td>
                      </motion.tr>
                    ))
                  )}
              </tbody>
          </table>
      </div>
    </div>
  );
}
