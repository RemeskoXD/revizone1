import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductsClient from './ProductsClient';

export default async function CustomerProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Fetch products shared with this customer
  const sharedProducts = await prisma.productShare.findMany({
    where: { customerId: session.user.id },
    include: {
      product: {
        include: {
          documents: true,
          manager: {
            select: { name: true, email: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  return <ProductsClient sharedProducts={sharedProducts} />;
}
