import { TechnicianSidebar } from '@/components/technician/TechnicianSidebar';
import { TechnicianHeader } from '@/components/technician/TechnicianHeader';
import { PageTransition } from '@/components/PageTransition';

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#111111] overflow-hidden">
      <div className="hidden md:block">
        <TechnicianSidebar />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TechnicianHeader />
        <main className="flex-1 overflow-y-auto p-6">
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
