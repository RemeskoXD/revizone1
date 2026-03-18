import { prisma } from '@/lib/prisma';

export async function checkAndReleaseExpiredOrders() {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  try {
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        assignedAt: {
          lt: oneDayAgo,
        },
        isPublic: false,
      },
    });

    if (expiredOrders.length > 0) {
      await prisma.order.updateMany({
        where: {
          id: { in: expiredOrders.map(o => o.id) },
        },
        data: {
          technicianId: null,
          companyId: null,
          isPublic: true,
          assignedAt: null,
        },
      });
      console.log(`Released ${expiredOrders.length} expired orders to public.`);
    }
  } catch (error) {
    console.error('Error checking expired orders:', error);
  }
}
