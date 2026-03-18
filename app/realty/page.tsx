import { StatCard } from '@/components/dashboard/StatCard';
import { FileText, Send, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AnimatedItem } from '@/components/AnimatedItem';

export default async function RealtyDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'REALTY') {
    redirect('/login');
  }

  // Fetch some basic stats
  const totalDocuments = await prisma.order.count({
    where: { customerId: session.user.id, status: 'COMPLETED' },
  });

  const pendingTransfers = await prisma.documentTransfer.count({
    where: { senderId: session.user.id, status: 'PENDING' },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-white">Realitní kancelář</h1>
            <p className="text-gray-400 mt-1">Vítejte, {session.user.name}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedItem delay={0.1}>
          <StatCard 
              title="Spravované dokumenty" 
              value={totalDocuments.toString()} 
              description="Dokončené revize"
              icon={FileText}
              href="/realty/documents"
          />
        </AnimatedItem>
        <AnimatedItem delay={0.2}>
          <StatCard 
              title="Čekající převody" 
              value={pendingTransfers.toString()} 
              description="Čeká na schválení příjemcem"
              icon={Clock}
              alert={pendingTransfers > 0}
              href="/realty/transfers"
          />
        </AnimatedItem>
        <AnimatedItem delay={0.3}>
          <StatCard 
              title="Dokončené převody" 
              value="0" 
              description="Úspěšně předáno"
              icon={CheckCircle2}
              href="/realty/transfers"
          />
        </AnimatedItem>
      </div>

      <AnimatedItem delay={0.4} className="bg-[#111] border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Převod dokumentů</h3>
          <p className="text-gray-400 text-sm mb-6">
              Zde můžete převést vlastnictví revizních zpráv na jiného uživatele (např. nového majitele nemovitosti). 
              Příjemce musí převod nejprve schválit ve svém účtu.
          </p>
          
          <div className="p-8 border-2 border-dashed border-white/10 rounded-xl text-center">
              <Send className="w-12 h-12 text-brand-yellow mx-auto mb-4" />
              <h4 className="text-white font-medium mb-2">Převést dokumenty</h4>
              <p className="text-sm text-gray-500 mb-6">
                  Přejděte do sekce Převody, kde můžete vybrat dokumenty a odeslat je jinému uživateli ke schválení.
              </p>
              <Link href="/realty/transfers" className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors">
                  Přejít na převody <Send className="w-4 h-4" />
              </Link>
          </div>
      </AnimatedItem>
    </div>
  );
}
