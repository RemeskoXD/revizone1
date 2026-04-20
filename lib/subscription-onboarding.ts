import { prisma } from '@/lib/prisma';
import {
  addCalendarMonths,
  licenseValidUntilAfterAnnualPay,
} from '@/lib/subscription-pricing';

/**
 * Dokončení „první roční platby“ po onboardingové bráně (fake Stripe).
 * Prodlouží licenci od konce 1měsíční zkušební lhůty o 12 měsíců.
 */
export async function completeFakeSubscriptionOnboarding(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { licenseValidUntil: true, requiresSubscriptionCheckout: true },
  });

  if (!user?.requiresSubscriptionCheckout) {
    return { ok: true as const, alreadyDone: true as const };
  }

  const trialEnd = user.licenseValidUntil ?? addCalendarMonths(new Date(), 1);
  const newUntil = licenseValidUntilAfterAnnualPay(trialEnd);

  await prisma.user.update({
    where: { id: userId },
    data: {
      requiresSubscriptionCheckout: false,
      licenseValidUntil: newUntil,
    },
  });

  return { ok: true as const, alreadyDone: false as const, licenseValidUntil: newUntil };
}
