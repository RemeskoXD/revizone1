'use client';

import { Search, Filter, MapPin, Calendar, Clock, ChevronRight, User, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

export default function TechnicianQueueClient({ jobs }: { jobs: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Moje zakázky</h1>
          <p className="text-gray-400">Správa přidělených revizí a nových poptávek.</p>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-[#1A1A1A] border border-white/5 rounded-xl">
            <p className="text-gray-500">Zatím nemáte žádné zakázky.</p>
          </div>
        ) : (
          jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={`/technician/job/${job.readableId}`} className="block group">
                  <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-6 hover:border-brand-yellow/50 transition-all hover:shadow-lg hover:shadow-brand-yellow/5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                  <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">#{job.readableId}</span>
                                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                      job.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                                      job.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500' :
                                      job.status === 'NEEDS_REVISION' ? 'bg-orange-500/10 text-orange-500' :
                                      job.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                                      'bg-yellow-500/10 text-yellow-500'
                                  }`}>
                                      {job.status === 'COMPLETED' ? 'Dokončeno' :
                                       job.status === 'IN_PROGRESS' ? 'Probíhá' :
                                       job.status === 'NEEDS_REVISION' ? 'K přepracování' :
                                       job.status === 'CANCELLED' ? 'Zrušeno' : 'Nová poptávka'}
                                  </span>
                              </div>
                              <h3 className="text-lg font-semibold text-white group-hover:text-brand-yellow transition-colors">{job.serviceType}</h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                  <div className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" /> {job.address}
                                  </div>
                                  <div className="flex items-center gap-1">
                                      <User className="w-4 h-4" /> {job.customer.name || job.customer.email}
                                  </div>
                                  {job.price && (
                                    <div className="flex items-center gap-1 text-brand-yellow">
                                        <DollarSign className="w-4 h-4" /> {job.price.toLocaleString('cs-CZ')} Kč
                                    </div>
                                  )}
                              </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                              <div className="text-right">
                                  <div className="flex items-center gap-1 text-white font-medium justify-end">
                                      <Calendar className="w-4 h-4 text-brand-yellow" /> {new Date(job.createdAt).toLocaleDateString('cs-CZ')}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {job.technicianId === null ? 'Čeká na přijetí' : 'Přiřazeno'}
                                  </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                          </div>
                      </div>
                  </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
