import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { redirectIfSubscriptionOnboardingRequired } from '@/lib/subscription-guard';
import DashboardShell from './DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }
  await redirectIfSubscriptionOnboardingRequired(session.user.id, session.user.role);
  return <DashboardShell>{children}</DashboardShell>;
}
