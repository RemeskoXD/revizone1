'use client';

import { Bell, User } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function TechnicianHeader() {
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b border-white/10 bg-[#111111] flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <span className="md:hidden font-bold text-white tracking-tight mr-2">REVIZONE APLIKACE</span>
        <h2 className="text-sm font-mono text-gray-500">PARTNER PORTAL v1.0</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
            <Bell className="w-5 h-5" />
          </button>
        </div>
        
        <div className="h-8 w-[1px] bg-white/10 mx-1"></div>

        <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{session?.user?.name || 'Technik'}</p>
                <p className="text-xs text-gray-500">Revizní technik</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center border border-white/10">
                <User className="w-5 h-5 text-gray-400" />
            </div>
        </div>
      </div>
    </header>
  );
}
