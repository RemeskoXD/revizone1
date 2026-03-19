import { StatCard } from '@/components/dashboard/StatCard';
import { Home, Send, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
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
  const totalProperties = await prisma.property.count({
    where: { ownerId: session.user.id },
  });

  const pendingTransfers = await prisma.property.count({
    where: { ownerId: session.user.id, transferStatus: 'CLAIMED' },
  });

  const completedTransfers = await prisma.activityLog.count({
    where: { userId: session.user.id, action: 'PROPERTY_TRANSFERRED' },
  });

  return (
    <div className="space-y-8">
      <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-white">Realitní kancelář</h1>
            <p className="text-gray-400 mt-1">Vítejte zpět, {session.user.name}</p>
        </div>
        <Link href="/realty/properties" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-yellow hover:bg-brand-yellow-hover text-black font-bold rounded-xl transition-all shadow-lg shadow-brand-yellow/20 active:scale-95">
          Spravovat nemovitosti <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedItem delay={0.1}>
          <StatCard 
              title="Spravované nemovitosti" 
              value={totalProperties.toString()} 
              description="Vaše nemovitosti"
              icon={Home}
              href="/realty/properties"
          />
        </AnimatedItem>
        <AnimatedItem delay={0.2}>
          <StatCard 
              title="Čekající převody" 
              value={pendingTransfers.toString()} 
              description="Čeká na vaše potvrzení"
              icon={Clock}
              alert={pendingTransfers > 0}
              href="/realty/transfers"
          />
        </AnimatedItem>
        <AnimatedItem delay={0.3}>
          <StatCard 
              title="Dokončené převody" 
              value={completedTransfers.toString()} 
              description="Úspěšně předáno"
              icon={CheckCircle2}
              href="/realty/transfers"
          />
        </AnimatedItem>
      </div>

      <AnimatedItem delay={0.4} className="bg-[#111] border border-white/10 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-xl font-bold text-white mb-3">Převod nemovitostí</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Zde můžete převést vlastnictví nemovitostí a jejich revizních zpráv na nového majitele. 
                Příjemce musí převod nejprve nárokovat pomocí speciálního odkazu, a vy jej následně potvrdíte.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 p-6 bg-[#1A1A1A] border border-white/5 rounded-xl flex flex-col items-start">
                  <div className="w-10 h-10 rounded-lg bg-brand-yellow/10 flex items-center justify-center mb-4">
                    <Send className="w-5 h-5 text-brand-yellow" />
                  </div>
                  <h4 className="text-white font-bold mb-2">1. Vygenerovat odkaz</h4>
                  <p className="text-sm text-gray-500 mb-6 flex-grow">
                      Přejděte do sekce Nemovitosti, vygenerujte odkaz pro převod a pošlete jej novému majiteli.
                  </p>
                  <Link href="/realty/properties" className="inline-flex items-center gap-2 text-sm text-brand-yellow hover:text-brand-yellow-hover font-semibold transition-colors">
                      Přejít na nemovitosti <ArrowRight className="w-4 h-4" />
                  </Link>
              </div>

              <div className="flex-1 p-6 bg-[#1A1A1A] border border-white/5 rounded-xl flex flex-col items-start">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <h4 className="text-white font-bold mb-2">2. Potvrdit převod</h4>
                  <p className="text-sm text-gray-500 mb-6 flex-grow">
                      Jakmile nový majitel odkaz otevře a nemovitost nárokuje, potvrdíte převod v sekci Čekající převody.
                  </p>
                  <Link href="/realty/transfers" className="inline-flex items-center gap-2 text-sm text-green-500 hover:text-green-400 font-semibold transition-colors">
                      Zkontrolovat převody <ArrowRight className="w-4 h-4" />
                  </Link>
              </div>
            </div>
          </div>
      </AnimatedItem>
    </div>
  );
}
