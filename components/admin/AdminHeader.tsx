'use client';

import { Bell, User, ShieldAlert } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrátor',
  SUPPORT: 'Support',
  CONTRACTOR: 'Dodavatel',
};

export function AdminHeader() {
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);

  const userName = session?.user?.name || 'Admin';
  const userRole = ROLE_LABELS[session?.user?.role || ''] || 'Administrátor';

  return (
    <header className="h-16 border-b border-white/10 bg-[#0a0a0a] flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <span className="md:hidden font-bold text-white tracking-tight mr-2">REVIZONE APLIKACE</span>
        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
            <ShieldAlert className="w-3 h-3 text-red-500" />
            <span className="text-xs font-medium text-red-500">ADMINISTRÁTORSKÝ PŘÍSTUP</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
          >
            <Bell className="w-5 h-5" />
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute right-0 mt-2 w-80 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-white/5">
                  <h3 className="font-semibold text-white">Upozornění</h3>
                </div>
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Žádná nová upozornění</p>
                </div>
              </div>
            </>
          )}
        </div>
        
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
