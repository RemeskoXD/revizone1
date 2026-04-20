import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isFakePaymentGatewayEnabled, resolveStripeSettingsReturnPath } from '@/lib/stripe-config';
import { getSubscriptionPlanForRole } from '@/lib/subscription-pricing';
import FakePaymentUI from './FakePaymentUI';

export const metadata = {
  title: 'Testovací platba | Revizone',
  robots: { index: false, follow: false },
};

export default async function PlatbaTestPage({
  searchParams,
}: {
  searchParams: Promise<{ rp?: string; m?: string; purpose?: string }>;
}) {
  if (!isFakePaymentGatewayEnabled()) {
    redirect('/dashboard/settings?tab=billing');
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/platba-test');
  }

  const q = await searchParams;
  const returnPath = resolveStripeSettingsReturnPath(q.rp);
  const mode = q.m === 'portal' ? 'portal' : 'checkout';
  const purpose = q.purpose === 'onboarding' ? 'onboarding' : 'settings';

  const row = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { requiresSubscriptionCheckout: true, role: true },
  });

  if (purpose === 'onboarding' && !row?.requiresSubscriptionCheckout) {
    redirect(returnPath);
  }

  const plan = getSubscriptionPlanForRole(row?.role ?? session.user.role);

  return (
    <FakePaymentUI
      returnPath={returnPath}
      mode={mode}
      purpose={purpose}
      planLabel={plan.label}
      yearlyPriceCzk={plan.yearlyPriceCzk}
    />
  );
}
