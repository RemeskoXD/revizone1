import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { FileText, MapPin, Calendar, Download } from 'lucide-react';
import Link from 'next/link';
import { AnimatedItem } from '@/components/AnimatedItem';

export default async function RealtyDocumentsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'REALTY') {
    redirect('/login');
  }

  const documents = await prisma.order.findMany({
    where: { customerId: session.user.id, status: 'COMPLETED' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Spravované dokumenty</h1>
          <p className="text-gray-400">Přehled všech dokončených revizních zpráv.</p>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">ID Dokumentu</th>
                <th className="px-6 py-4">Typ služby</th>
                <th className="px-6 py-4">Adresa</th>
                <th className="px-6 py-4">Datum dokončení</th>
                <th className="px-6 py-4 text-right">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Zatím nemáte žádné dokončené revizní zprávy.
                  </td>
                </tr>
              ) : (
                documents.map((doc, index) => (
                  <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-500">
                      <AnimatedItem delay={0.1 * index}>#{doc.readableId}</AnimatedItem>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      <AnimatedItem delay={0.1 * index} className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-yellow" /> {doc.serviceType}
                      </AnimatedItem>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      <AnimatedItem delay={0.1 * index} className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {doc.address}
                      </AnimatedItem>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      <AnimatedItem delay={0.1 * index} className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(doc.updatedAt).toLocaleDateString('cs-CZ')}
                      </AnimatedItem>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <AnimatedItem delay={0.1 * index}>
                        <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-xs font-medium">
                          <Download className="w-3 h-3" /> Stáhnout PDF
                        </button>
                      </AnimatedItem>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
