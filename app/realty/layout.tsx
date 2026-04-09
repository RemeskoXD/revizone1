import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Building2, Home, Send, Settings } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { LogoutButton } from '@/components/LogoutButton';
import { MobileSidebarToggle } from '@/components/MobileSidebarToggle';

export default async function RealtyLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'REALTY') redirect('/login');

  return (
    <div className="min-h-screen bg-black text-white flex">
      <MobileSidebarToggle>
        <div className="p-6">
          <Link href="/realty" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-lg">R</span>
            </div>
            Revizone <span className="text-xs text-brand-yellow font-normal px-2 py-0.5 bg-brand-yellow/10 rounded-full">Reality</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Správa</p>
          <Link href="/realty" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Building2 className="w-4 h-4" /> Přehled
          </Link>
          <Link href="/realty/properties" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Home className="w-4 h-4" /> Nemovitosti
          </Link>
          <Link href="/realty/transfers" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Send className="w-4 h-4" /> Převody
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-white/10">
              <span className="text-xs font-medium text-white">{session.user.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            </div>
          </div>
          <Link href="/realty/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Settings className="w-4 h-4" /> Nastavení
          </Link>
          <LogoutButton />
        </div>
      </MobileSidebarToggle>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <PageTransition>{children}</PageTransition>
          </div>
        </div>
      </main>
    </div>
  );
}
