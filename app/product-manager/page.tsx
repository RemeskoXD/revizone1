import { StatCard } from '@/components/dashboard/StatCard';
import { Package, Users, FileText, ArrowUpRight } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { AnimatedItem } from '@/components/AnimatedItem';

export default async function ProductManagerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'PRODUCT_MANAGER') {
    redirect('/login');
  }

  const productsCount = await prisma.product.count({
    where: { managerId: session.user.id }
  });

  const sharesCount = await prisma.productShare.count({
    where: { product: { managerId: session.user.id } }
  });

  const documentsCount = await prisma.productDocument.count({
    where: { product: { managerId: session.user.id } }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-white">Přehled produktového manažera</h1>
            <p className="text-gray-400 mt-1">Správa vašich produktů a sdílení se zákazníky.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedItem delay={0.1}>
          <StatCard 
              title="Moje produkty" 
              value={productsCount.toString()} 
              description="Celkový počet produktů"
              icon={Package}
              href="/product-manager/products"
          />
        </AnimatedItem>
        <AnimatedItem delay={0.2}>
          <StatCard 
              title="Sdíleno zákazníkům" 
              value={sharesCount.toString()} 
              description="Aktivní sdílení"
              icon={Users}
          />
        </AnimatedItem>
        <AnimatedItem delay={0.3}>
          <StatCard 
              title="Dokumentace" 
              value={documentsCount.toString()} 
              description="Nahrané soubory"
              icon={FileText}
          />
        </AnimatedItem>
      </div>

      {productsCount === 0 && (
        <AnimatedItem delay={0.4} className="bg-[#111] border border-white/5 rounded-xl p-6 text-center py-12">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Zatím nemáte žádné produkty</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            Zde budete moci vkládat produkty s veškerou dokumentací a předávat je zákazníkům přes sdílecí odkaz.
          </p>
          <Link href="/product-manager/products" className="inline-block px-6 py-2.5 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors">
            Přidat první produkt
          </Link>
        </AnimatedItem>
      )}
    </div>
  );
}
