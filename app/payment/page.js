'use client';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import PlanStatusBadge from '@/components/PlanStatusBadge';

const paymentPlans = {
  premium: {
    name: 'Premium',
    price: '$9.99 / month',
    description: 'Unlimited letter improvements, advanced AI customization, and priority support.',
  },
  pro: {
    name: 'Pro',
    price: '$24.99 / month',
    description: 'Everything in Premium plus API access, team collaboration, and custom integrations.',
  },
};

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planKey = searchParams.get('plan')?.toLowerCase() || '';
  const plan = paymentPlans[planKey];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-semibold text-gray-900">Payment Page</h1>
            <p className="mt-2 text-gray-600 max-w-2xl">
              You are on the plan checkout page. Select a plan from Pricing and return here to complete payment.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="rounded-full border border-sky-200 bg-white px-5 py-3 text-sm font-medium text-sky-700 hover:bg-sky-50 transition">
              Back to Pricing
            </Link>
            <Link href="/dashboard" className="rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl bg-white p-10 shadow-lg border border-gray-100">
            {plan ? (
              <>
                <div className="mb-8">
                  <p className="text-sm uppercase tracking-[0.2em] text-sky-600 font-semibold">Selected plan</p>
                  <h2 className="mt-3 text-3xl font-bold text-gray-900">{plan.name}</h2>
                  <p className="mt-2 text-gray-600">{plan.description}</p>
                </div>

                <div className="rounded-3xl bg-sky-50 p-6 border border-sky-100">
                  <p className="text-lg font-semibold text-gray-900">{plan.price}</p>
                  <p className="mt-3 text-gray-600">
                    The payment processing integration is not yet configured in this app, but this page demonstrates the checkout route opening correctly.
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  <button
                    onClick={() => router.push(`/payment/success?plan=${planKey}`)}
                    className="w-full rounded-full bg-sky-600 px-5 py-3 text-white font-semibold hover:bg-sky-700 transition"
                  >
                    Continue to payment
                  </button>
                  <p className="text-sm text-gray-500">
                    Note: this button now advances to the local payment confirmation page. Real payment provider integration is still pending.
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <p className="text-lg font-semibold text-gray-900">No plan selected</p>
                <p className="mt-3 text-gray-600">Please choose Premium or Pro from the pricing page, and the payment page will open with your selected plan.</p>
                <Link href="/pricing" className="mt-6 inline-flex rounded-full bg-sky-600 px-5 py-3 text-white font-medium hover:bg-sky-700 transition">
                  Go to Pricing
                </Link>
              </div>
            )}
          </div>

          <aside className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
            <PlanStatusBadge user={{}} />
            <div className="mt-8 space-y-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">How this works</p>
              <p>Select the plan you want on the Pricing page, then this payment page will open with your plan details.</p>
              <p>The next step would be connecting a real payment provider such as Stripe or PayPal.</p>
              <p>Until that integration is added, this page confirms the user's action is routed to the payment page correctly.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
