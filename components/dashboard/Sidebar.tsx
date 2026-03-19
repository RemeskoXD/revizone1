'use client';

import Link from 'next/link';
import { LayoutDashboard, FileText, ShieldCheck, Settings, LogOut, PlusCircle, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Přehled', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Objednávky', href: '/dashboard/orders', icon: FileText },
  { name: 'Trezor revizí', href: '/dashboard/vault', icon: ShieldCheck },
  { name: 'Nastavení', href: '/dashboard/settings', icon: Settings },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
        {/* Mobile Overlay */}
        <div 
            className={cn(
                "fixed inset-0 bg-black/80 z-40 md:hidden transition-opacity duration-300",
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={onClose}
        />

        {/* Sidebar Content */}
        <div className={cn(
            "flex h-full w-64 flex-col bg-[#1A1A1A] border-r border-white/10 transition-transform duration-300 z-50",
            "fixed md:relative inset-y-0 left-0",
            isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
            <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
                <Link href="/dashboard" className="flex items-center gap-2">
                {/* Logo placeholder mimicking Revizone style */}
                <div className="relative flex items-center justify-center w-8 h-8 bg-brand-yellow rounded-md">
                    <ShieldCheck className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">REVIZONE APLIKACE</span>
                </Link>
                
                {/* Close button for mobile */}
                <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 flex flex-col gap-1 px-3 py-6">
                <div className="px-3 mb-2">
                    <Link href="/dashboard/new-order" onClick={onClose} className="w-full flex items-center justify-center gap-2 bg-brand-yellow hover:bg-brand-yellow-hover text-black font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-lg shadow-brand-yellow/10">
                        <PlusCircle className="w-5 h-5" />
                        <span>Nová revize</span>
                    </Link>
                </div>

                <div className="mt-6 space-y-1">
                    <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</p>
                    {navigation.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={onClose}
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
    </>
  );
}
