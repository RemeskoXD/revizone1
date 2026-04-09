'use client';

import { useState } from 'react';
import { TechnicianSidebar } from '@/components/technician/TechnicianSidebar';
import { TechnicianHeader } from '@/components/technician/TechnicianHeader';
import { PageTransition } from '@/components/PageTransition';

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#111111] overflow-hidden">
      <TechnicianSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TechnicianHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <PageTransition>
                  {children}
                </PageTransition>
            </div>
        </main>
      </div>
    </div>
  );
}
