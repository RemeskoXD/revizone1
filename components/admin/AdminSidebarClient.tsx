'use client';

import Link from 'next/link';
import { LayoutDashboard, Users, FileText, Settings, ShieldAlert, Activity, ShieldCheck, UserCheck, LogOut, X, Mail, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession, signOut } from 'next-auth/react';

const navigation = [
  { name: 'Přehled', href: '/admin', icon: LayoutDashboard, roles: ['ADMIN', 'SUPPORT', 'CONTRACTOR'] },
  { name: 'Objednávky', href: '/admin/orders', icon: FileText, roles: ['ADMIN', 'SUPPORT', 'CONTRACTOR'] },
  { name: 'Uživatelé', href: '/admin/users', icon: Users, roles: ['ADMIN', 'SUPPORT'] },
  { name: 'Žádosti o role', href: '/admin/roles', icon: UserCheck, roles: ['ADMIN', 'SUPPORT'] },
  { name: 'Smazání účtů', href: '/admin/account-deletions', icon: UserX, roles: ['ADMIN', 'SUPPORT'] },
  { name: 'Revize – Data', href: '/admin/revisions', icon: ShieldCheck, roles: ['ADMIN', 'SUPPORT'] },
  { name: 'E-maily', href: '/admin/emails', icon: Mail, roles: ['ADMIN', 'SUPPORT'] },
  { name: 'Historie', href: '/admin/history', icon: Activity, roles: ['ADMIN', 'SUPPORT'] },
  { name: 'Nastavení', href: '/admin/settings', icon: Settings, roles: ['ADMIN'] },
];

interface AdminSidebarClientProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebarClient({ isOpen, onClose }: AdminSidebarClientProps) {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const filteredNavigation = navigation.filter(item => role && item.roles.includes(role));

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/80 z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden
      />

      <div className={cn(
        "flex h-full w-[min(18rem,88vw)] sm:w-64 flex-col bg-[#111] border-r border-white/10 z-50",
        "fixed lg:relative inset-y-0 left-0 transition-transform duration-300 pt-[env(safe-area-inset-top)] lg:pt-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex min-h-14 shrink-0 items-center justify-between gap-2 px-4 sm:px-6 border-b border-white/10">
          <Link href="/admin" className="flex min-w-0 items-center gap-2" onClick={onClose}>
             <div className="relative flex shrink-0 items-center justify-center w-8 h-8 bg-red-600 rounded-md">
                <ShieldAlert className="w-5 h-5 text-white" />
             </div>
             <span className="text-base sm:text-lg font-bold text-white tracking-tight truncate">Revizone</span>
          </Link>
          <button type="button" onClick={onClose} className="lg:hidden shrink-0 touch-manipulation rounded-lg p-2 text-gray-400 hover:text-white" aria-label="Zavřít menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-1 px-3 py-6">
          <div className="space-y-1">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Správa</p>
              {filteredNavigation.map((item) => (
              <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
              >
                  <item.icon className="w-5 h-5 group-hover:text-red-500 transition-colors" />
                  {item.name}
              </Link>
              ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            Odhlásit se
          </button>
        </div>
      </div>
    </>
  );
}
