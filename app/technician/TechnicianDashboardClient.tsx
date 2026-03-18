'use client';

import { StatCard } from '@/components/dashboard/StatCard';
import { ClipboardList, CheckCircle2, DollarSign, MapPin, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { AnimatedItem } from '@/components/AnimatedItem';

export default function TechnicianDashboardClient({ user, newRequestsCount, openJobsCount, completedJobsCount, expectedEarnings, newRequests, todaysJobs }: any) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-white">Vítejte, {user?.name?.split(' ')[0] || 'Techniku'} ⚡</h1>
            <p className="text-gray-400 mt-1">Máte <span className="text-brand-yellow font-bold">{newRequestsCount} nové zakázky</span> čekající na potvrzení.</p>
        </div>
        <div className="flex gap-3">
            <Link href="/technician/queue" className="px-4 py-2 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> Přejít na zakázky
            </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedItem delay={0.1}>
          <StatCard 
              title="Otevřené zakázky" 
              value={openJobsCount.toString()} 
              description="Vyžadují akci"
              icon={ClipboardList}
              alert={openJobsCount > 0}
              href="/technician/queue"
          />
        </AnimatedItem>
        <AnimatedItem delay={0.2}>
          <StatCard 
              title="Dokončeno celkem" 
              value={completedJobsCount.toString()} 
              description="Vaše úspěšné revize"
              icon={CheckCircle2}
              trendUp={true}
              href="/technician/queue"
          />
        </AnimatedItem>
        <AnimatedItem delay={0.3}>
          <StatCard 
              title="Očekávaný výdělek" 
              value={`${expectedEarnings.toLocaleString('cs-CZ')} Kč`} 
              description="Z aktivních zakázek"
              icon={DollarSign}
              href="/technician/queue"
          />
        </AnimatedItem>
      </div>

      {/* Active Jobs Map/List Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <AnimatedItem delay={0.4} className="bg-[#1A1A1A] border border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-yellow" /> Vaše zakázky
            </h3>
            <div className="space-y-4">
                {todaysJobs.length === 0 ? (
                  <p className="text-gray-500 text-sm">Zatím nemáte žádné aktivní zakázky.</p>
                ) : (
                  todaysJobs.map((job: any, index: number) => (
                      <Link href={`/technician/job/${job.readableId}`} key={job.id} className="block">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.1 }}
                            className="flex gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                        >
                            <div className="flex flex-col items-center">
                                <span className="text-sm font-mono text-brand-yellow">-</span>
                                <div className="h-full w-px bg-white/10 my-2"></div>
                            </div>
                            <div>
                                <h4 className="font-medium text-white">{job.serviceType}</h4>
                                <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                                    <MapPin className="w-3 h-3" /> {job.address}
                                </div>
                            </div>
                            <div className="ml-auto flex flex-col items-end justify-center">
                                <span className="text-xs font-medium px-2 py-1 rounded bg-white/10 text-gray-300">
                                  {job.status === 'IN_PROGRESS' ? 'Probíhá' : 'Čeká'}
                                </span>
                                <span className="text-xs text-brand-yellow mt-2 hover:underline">Detail</span>
                            </div>
                        </motion.div>
                      </Link>
                  ))
                )}
            </div>
        </AnimatedItem>

        {/* New Requests */}
        <AnimatedItem delay={0.5} className="bg-[#1A1A1A] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Nové poptávky</h3>
                <span className="text-xs bg-brand-yellow text-black font-bold px-2 py-1 rounded-full">{newRequestsCount}</span>
            </div>
            <div className="space-y-3">
                {newRequests.length === 0 ? (
                  <p className="text-gray-500 text-sm">Zatím nejsou žádné nové poptávky.</p>
                ) : (
                  newRequests.map((req: any, index: number) => (
                      <motion.div 
                          key={req.id} 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-[#111] rounded-lg border border-white/5"
                      >
                          <div>
                              <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-gray-500">#{req.readableId}</span>
                                  <span className="text-sm font-medium text-white">{req.serviceType}</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">{req.address}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-sm font-bold text-brand-yellow">Dle ceníku</p>
                              <Link href={`/technician/job/${req.readableId}`} className="text-xs text-white hover:underline mt-1 inline-block">Detail</Link>
                          </div>
                      </motion.div>
                  ))
                )}
                {newRequestsCount > 3 && (
                  <Link href="/technician/queue" className="block text-center w-full py-2 text-sm text-gray-400 hover:text-white border border-dashed border-white/10 rounded-lg hover:bg-white/5 transition-colors mt-2">
                      Zobrazit další poptávky
                  </Link>
                )}
            </div>
        </AnimatedItem>
      </div>
    </div>
  );
}
