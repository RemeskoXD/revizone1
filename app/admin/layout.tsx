import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { PageTransition } from '@/components/PageTransition';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminHeader />
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
