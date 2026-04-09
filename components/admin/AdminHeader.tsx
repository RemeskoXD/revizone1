'use client';

import { User, ShieldAlert, Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { NotificationBell } from '@/components/NotificationBell';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrátor',
  SUPPORT: 'Support',
  CONTRACTOR: 'Dodavatel',
};

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { data: session } = useSession();

  const userName = session?.user?.name || 'Admin';
  const userRole = ROLE_LABELS[session?.user?.role || ''] || 'Administrátor';

  return (
    <header className="h-16 border-b border-white/10 bg-[#0a0a0a] flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="md:hidden font-bold text-white tracking-tight mr-2">REVIZONE APLIKACE</span>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
            <ShieldAlert className="w-3 h-3 text-red-500" />
            <span className="text-xs font-medium text-red-500">ADMINISTRÁTORSKÝ PŘÍSTUP</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        
        <div className="h-8 w-[1px] bg-white/10 mx-1"></div>

        <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{userName}</p>
                <p className="text-xs text-gray-500">{userRole}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-red-900/20 flex items-center justify-center border border-red-500/20">
                <User className="w-5 h-5 text-red-500" />
            </div>
        </div>
      </div>
    </header>
  );
}
