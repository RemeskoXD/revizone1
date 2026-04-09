'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileSidebarToggle({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 p-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div
        className={cn(
          "fixed inset-0 bg-black/80 z-40 md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      <aside className={cn(
        "w-64 bg-[#111] border-r border-white/5 flex-col z-50",
        "fixed md:relative inset-y-0 left-0 transition-transform duration-300",
        "md:flex",
        isOpen ? "flex translate-x-0" : "-translate-x-full md:translate-x-0 hidden md:flex"
      )}>
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div onClick={() => setIsOpen(false)} className="flex flex-col h-full">
          {children}
        </div>
      </aside>
    </>
  );
}
