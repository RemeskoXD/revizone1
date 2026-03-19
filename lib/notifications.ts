import { prisma } from '@/lib/prisma';

type NotificationType = 'ORDER_ASSIGNED' | 'ORDER_COMPLETED' | 'REVISION_EXPIRING' | 'MESSAGE' | 'TECHNICIAN_SCHEDULED' | 'DEFECT_CREATED' | 'ORDER_STATUS_CHANGED' | 'REVIEW_RECEIVED';

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  try {
    await prisma.notification.create({ data: params });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

export async function notifyOrderAssigned(orderId: string, orderReadableId: string, customerId: string, technicianName: string) {
  await createNotification({
    userId: customerId,
    type: 'ORDER_ASSIGNED',
    title: 'Technik přiřazen',
    message: `Objednávku #${orderReadableId} přijal technik ${technicianName}.`,
    link: `/dashboard/orders/${orderReadableId}`,
  });
}

export async function notifyOrderCompleted(orderId: string, orderReadableId: string, customerId: string, result: string) {
  const resultLabel = result === 'PASS' ? 'bez závad' : result === 'FAIL' ? 'nevyhovuje' : 's výhradami';
  await createNotification({
    userId: customerId,
    type: 'ORDER_COMPLETED',
    title: 'Revize dokončena',
    message: `Revize #${orderReadableId} byla dokončena – výsledek: ${resultLabel}. Zpráva je ke stažení.`,
    link: `/dashboard/orders/${orderReadableId}`,
  });
}

export async function notifyScheduleSet(orderReadableId: string, customerId: string, date: string) {
  await createNotification({
    userId: customerId,
    type: 'TECHNICIAN_SCHEDULED',
    title: 'Termín potvrzen',
    message: `Technik potvrdil termín revize #${orderReadableId} na ${date}.`,
    link: `/dashboard/orders/${orderReadableId}`,
  });
}

export async function notifyNewOrder(technicianId: string, orderReadableId: string, serviceType: string) {
  await createNotification({
    userId: technicianId,
    type: 'ORDER_ASSIGNED',
    title: 'Nová zakázka',
    message: `Byla vám přiřazena zakázka #${orderReadableId} – ${serviceType}.`,
    link: `/technician/job/${orderReadableId}`,
  });
}

export async function notifyDefectCreated(customerId: string, orderReadableId: string) {
  await createNotification({
    userId: customerId,
    type: 'DEFECT_CREATED',
    title: 'Zjištěna závada',
    message: `Při revizi #${orderReadableId} byly zjištěny závady. Podívejte se na úkoly.`,
    link: `/dashboard/orders/${orderReadableId}`,
  });
}

export async function notifyReviewReceived(technicianId: string, rating: number, orderReadableId: string) {
  await createNotification({
    userId: technicianId,
    type: 'REVIEW_RECEIVED',
    title: 'Nové hodnocení',
    message: `Zákazník ohodnotil revizi #${orderReadableId} – ${rating}/5 hvězd.`,
    link: `/technician/job/${orderReadableId}`,
  });
}
