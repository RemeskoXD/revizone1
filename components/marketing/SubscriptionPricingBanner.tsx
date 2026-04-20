import { SUBSCRIPTION_PLANS } from '@/lib/subscription-pricing';

export default function SubscriptionPricingBanner() {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-brand-yellow/10 to-transparent p-4 text-sm text-gray-300 sm:p-5">
      <p className="font-semibold text-white">Předplatné Revizone</p>
      <p className="mt-1 text-xs text-gray-400">
        U každého balíčku je první měsíc od registrace zdarma, poté roční platba:
      </p>
      <ul className="mt-3 space-y-1.5 text-xs sm:text-sm">
        <li>
          <span className="text-white">{SUBSCRIPTION_PLANS.CUSTOMER.label}</span> —{' '}
          {SUBSCRIPTION_PLANS.CUSTOMER.yearlyPriceCzk.toLocaleString('cs-CZ')} Kč / rok
        </li>
        <li>
          <span className="text-white">{SUBSCRIPTION_PLANS.TECHNICIAN.label}</span> —{' '}
          {SUBSCRIPTION_PLANS.TECHNICIAN.yearlyPriceCzk.toLocaleString('cs-CZ')} Kč / rok
        </li>
        <li>
          <span className="text-white">{SUBSCRIPTION_PLANS.COMPANY_ADMIN.label}</span> —{' '}
          {SUBSCRIPTION_PLANS.COMPANY_ADMIN.yearlyPriceCzk.toLocaleString('cs-CZ')} Kč / rok
        </li>
      </ul>
    </div>
  );
}
