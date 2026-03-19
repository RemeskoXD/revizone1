'use client';

import Link from 'next/link';
import { LayoutDashboard, ClipboardList, MessageSquare, User, LogOut, HardHat } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Přehled', href: '/technician', icon: LayoutDashboard },
  { name: 'Moje zakázky', href: '/technician/queue', icon: ClipboardList },
  { name: 'Zprávy', href: '/technician/messages', icon: MessageSquare },
  { name: 'Profil', href: '/technician/profile', icon: User },
];

export function TechnicianSidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-[#1A1A1A] border-r border-white/10">
      <div className="flex h-16 items-center px-6 border-b border-white/10">
        <Link href="/technician" className="flex items-center gap-2">
           <div className="relative flex items-center justify-center w-8 h-8 bg-brand-yellow rounded-md">
              <HardHat className="w-5 h-5 text-black" />
           </div>
           <span className="text-xl font-bold text-white tracking-tight">REVIZONE APLIKACE</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col gap-1 px-3 py-6">
        <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</p>
            {navigation.map((item) => (
            <Link
                key={item.name}
                href={item.href}
                className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                "text-gray-400 hover:text-white hover:bg-white/5"
                )}
            >
                <item.icon className="w-5 h-5 group-hover:text-brand-yellow transition-colors" />
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
  );
}
