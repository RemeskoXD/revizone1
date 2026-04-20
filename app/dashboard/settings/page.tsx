import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { isCheckoutAvailable, isFakePaymentGatewayEnabled } from '@/lib/stripe-config';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <SettingsClient
      user={user}
      stripeConfigured={isCheckoutAvailable()}
      stripeFakeMode={isFakePaymentGatewayEnabled()}
    />
  );
}
