import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductsClient from './ProductsClient';

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'PRODUCT_MANAGER') {
    redirect('/login');
  }

  const products = await prisma.product.findMany({
    where: { managerId: session.user.id },
    include: {
      documents: true,
      shares: {
        include: {
          customer: {
            select: { id: true, name: true, email: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  // Convert dates to strings for client component
  const serializedProducts = products.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    documents: p.documents.map(d => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    })),
    shares: p.shares.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
  }));

  return <ProductsClient initialProducts={serializedProducts} />;
}
