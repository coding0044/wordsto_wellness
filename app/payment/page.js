'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useAuth';
import { subscribe } from '@/services/authService';
import PlanStatusBadge from '@/components/PlanStatusBadge';

const paymentPlans = {
  premium: {
    name: 'Premium',
    price: '$9.99 / month',
    description: 'Unlimited letter improvements, advanced AI customization, and priority support.',
  },
  expert: {
    name: 'Expert',
    price: '$24.99 / month',
    description: 'Everything in Premium plus expert support, team tools, and full feature access.',
  },
  free: {
    name: 'Free',
    price: '$0 / month',
    description: 'Switch back to the free plan with limited monthly improvements and no payment required.',
  },
};

function normalizePlanKey(planKey) {
  if (!planKey) return '';
  const normalized = planKey.toLowerCase();
  if (normalized === 'pro') return 'expert';
  return normalized;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Get current user first, then determine the effective plan: prefer query param, fall back to the user's current plan, then Free
  const { data: userData, isLoading, error } = useCurrentUser();
  const queryPlanKey = normalizePlanKey(searchParams.get('plan'));
  const currentPlanFromUser = userData?.planName || userData?.plan?.name || userData?.subscription?.plan;
  const userPlanKey = currentPlanFromUser ? normalizePlanKey(currentPlanFromUser) : 'free';
  const planKey = queryPlanKey || userPlanKey || 'free';
  const plan = paymentPlans[planKey] || paymentPlans.free;

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (error) {
      router.push('/login');
    }
  }, [error, router]);

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    if (!plan) {
      setErrorMessage('Please choose a valid plan before continuing.');
      return;
    }

    if (planKey === 'free') {
      try {
        setErrorMessage('');
        setIsSubmitting(true);
        await subscribe({ plan: plan.name, status: 'active' });
        router.push(`/payment/success?plan=${planKey}`);
      } catch (err) {
        setErrorMessage(err?.message || 'Failed to switch to the free plan. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!cardName || !cardNumber || !expiry || !cvc) {
      setErrorMessage('Please fill in all payment fields.');
      return;
    }

    try {
      setErrorMessage('');
      setIsSubmitting(true);
      await subscribe({ plan: plan.name, status: 'active' });
      router.push(`/payment/success?plan=${planKey}`);
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to complete the subscription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-center">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-semibold text-gray-900">Checkout</h1>
            <p className="mt-2 text-gray-600 max-w-2xl">
              Complete your plan selection and confirm your upgrade. Your plan will be saved to your account immediately.
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

                <div className="rounded-3xl bg-sky-50 p-6 border border-sky-100 mb-8">
                  <p className="text-lg font-semibold text-gray-900">{plan.price}</p>
                  <p className="mt-3 text-gray-600">
                    This checkout form is a placeholder for the payment process. A real gateway integration can be added here later.
                  </p>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  {planKey === 'free' ? (
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6 text-emerald-700">
                      <p className="text-base font-semibold">No payment required for the Free plan.</p>
                      <p className="mt-2 text-sm text-emerald-700">
                        Click the button below to switch back to Free. Your account plan will update immediately.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-sm font-semibold text-gray-700">Name on card</span>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="mt-2 block w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            placeholder="Jane Doe"
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-semibold text-gray-700">Card number</span>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="mt-2 block w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            placeholder="1234 5678 9012 3456"
                          />
                        </label>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-sm font-semibold text-gray-700">Expiry</span>
                          <input
                            type="text"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            className="mt-2 block w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            placeholder="MM / YY"
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-semibold text-gray-700">CVC</span>
                          <input
                            type="text"
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value)}
                            className="mt-2 block w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            placeholder="123"
                          />
                        </label>
                      </div>
                    </>
                  )}

                  {errorMessage && (
                    <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-700">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-sky-600 px-5 py-3 text-white font-semibold hover:bg-sky-700 transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Processing...' : planKey === 'free' ? 'Switch to Free' : `Subscribe to ${plan.name}`}
                  </button>
                </form>
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <p className="text-lg font-semibold text-gray-900">No plan selected</p>
                <p className="mt-3 text-gray-600">Please choose Premium or Expert from the pricing page, and the payment page will open with your selected plan.</p>
                <Link href="/pricing" className="mt-6 inline-flex rounded-full bg-sky-600 px-5 py-3 text-white font-medium hover:bg-sky-700 transition">
                  Go to Pricing
                </Link>
              </div>
            )}
          </div>

          <aside className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
            <PlanStatusBadge user={userData} />
            <div className="mt-8 space-y-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">How this subscription works</p>
              <p>Select the plan you want and submit the checkout form. The selected plan will be applied to your account instantly.</p>
              <p>If this were connected to Stripe or PayPal, this is where the payment provider would confirm the charge.</p>
              <p>The current implementation saves the plan choice in your user profile and keeps dashboard access in sync.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
