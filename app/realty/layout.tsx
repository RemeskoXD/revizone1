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
    <div className="flex min-h-dvh bg-black text-white">
      <MobileSidebarToggle>
        <div className="p-6">
          <Link href="/realty" className="flex flex-wrap items-center gap-2 text-lg font-bold tracking-tight text-white sm:text-xl">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-yellow">
              <span className="text-lg font-black text-black">R</span>
            </div>
            <span className="min-w-0">Revizone</span>
            <span className="rounded-full bg-brand-yellow/10 px-2 py-0.5 text-xs font-normal text-brand-yellow">Reality</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Správa</p>
          <Link href="/realty" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
            <Building2 className="h-4 w-4" /> Přehled
          </Link>
          <Link href="/realty/properties" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
            <Home className="h-4 w-4" /> Nemovitosti
          </Link>
          <Link href="/realty/transfers" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
            <Send className="h-4 w-4" /> Převody
          </Link>
        </nav>

        <div className="border-t border-white/5 p-4">
          <div className="mb-2 flex items-center gap-3 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-gray-800">
              <span className="text-xs font-medium text-white">{session.user.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{session.user.name}</p>
              <p className="truncate text-xs text-gray-500">{session.user.email}</p>
            </div>
          </div>
          <Link href="/realty/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
            <Settings className="h-4 w-4" /> Nastavení
          </Link>
          <LogoutButton />
        </div>
      </MobileSidebarToggle>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pt-14 pb-[env(safe-area-inset-bottom)] lg:pt-0">
        <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <PageTransition>{children}</PageTransition>
          </div>
        </div>
      </main>
    </div>
  );
}
