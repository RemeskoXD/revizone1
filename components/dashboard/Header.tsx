import { Bell, Search, User, Menu } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

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

        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Hledat v objednávkách..." 
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-brand-yellow rounded-full border border-[#111111]"></span>
            </button>

            {showNotifications && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-white/5">
                            <h3 className="font-semibold text-white">Upozornění</h3>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            {[
                                { title: 'Blíží se termín revize', desc: 'Elektroinstalace - Byt Praha 5', time: 'Před 2 hodinami', unread: true },
                                { title: 'Nová zpráva od technika', desc: 'Petr Novák: Dobrý den, potvrzuji...', time: 'Včera', unread: true },
                                { title: 'Faktura vystavena', desc: 'Objednávka #ORD-2023-156', time: '15. 05. 2023', unread: false },
                            ].map((notif, i) => (
                                <div key={i} className={cn("p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer", notif.unread ? "bg-brand-yellow/5" : "")}>
                                    <div className="flex justify-between items-start mb-1">
                                        <p className={cn("text-sm font-medium", notif.unread ? "text-white" : "text-gray-400")}>{notif.title}</p>
                                        <span className="text-[10px] text-gray-500">{notif.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2">{notif.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 border-t border-white/5 text-center">
                            <button onClick={() => alert('Všechna upozornění byla označena jako přečtená.')} className="text-xs text-brand-yellow hover:underline">Označit vše jako přečtené</button>
                        </div>
                    </div>
                </>
            )}
        </div>
        
        <div className="h-8 w-[1px] bg-white/10 mx-1"></div>

        <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">Jan Novák</p>
                <p className="text-xs text-gray-500">Zákazník</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center border border-white/10">
                <User className="w-5 h-5 text-gray-400" />
            </div>
        </div>
      </div>
    </header>
  );
}
