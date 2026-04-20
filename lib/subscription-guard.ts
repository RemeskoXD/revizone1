import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { buildPlatbaTestOnboardingUrl, isFakePaymentGatewayEnabled } from '@/lib/stripe-config';

const ONBOARDING_ROLES = new Set(['CUSTOMER', 'TECHNICIAN', 'COMPANY_ADMIN']);

export function subscriptionSettingsPathForRole(role: string): string {
  return role === 'COMPANY_ADMIN' ? '/company/settings' : '/dashboard/settings';
}

/** Přesměruje na dokončení předplatného, pokud to uživatel ještě neudělal. */
export async function redirectIfSubscriptionOnboardingRequired(
  userId: string,
  role: string
): Promise<void> {
  if (!ONBOARDING_ROLES.has(role)) return;

  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { requiresSubscriptionCheckout: true },
  });

  if (!row?.requiresSubscriptionCheckout) return;

  const returnPath = subscriptionSettingsPathForRole(role);

  if (isFakePaymentGatewayEnabled()) {
    redirect(buildPlatbaTestOnboardingUrl(returnPath));
  }
  redirect(`${returnPath}?tab=billing`);
}
