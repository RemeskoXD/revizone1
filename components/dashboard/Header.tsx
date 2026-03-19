import { Search, User, Menu } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/NotificationBell';

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'Zákazník',
  TECHNICIAN: 'Revizní technik',
  COMPANY_ADMIN: 'Správce firmy',
  REALTY: 'Realitní správce',
  ADMIN: 'Administrátor',
  SUPPORT: 'Support',
  CONTRACTOR: 'Dodavatel',
};

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userName = session?.user?.name || 'Uživatel';
  const userRole = ROLE_LABELS[session?.user?.role || ''] || 'Zákazník';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/orders?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 border-b border-white/10 bg-[#111111] flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <button 
            onClick={onMenuClick}
            className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
            <Menu className="w-6 h-6" />
        </button>
        <span className="md:hidden font-bold text-white tracking-tight">REVIZONE APLIKACE</span>

        <form onSubmit={handleSearch} className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Hledat v objednávkách..." 
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow/50 transition-colors"
          />
        </form>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        
        <div className="h-8 w-[1px] bg-white/10 mx-1"></div>

        <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{userName}</p>
                <p className="text-xs text-gray-500">{userRole}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center border border-white/10">
                <User className="w-5 h-5 text-gray-400" />
            </div>
        </div>
      </div>
    </header>
  );
}
