'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const paymentPlans = {
  premium: {
    name: 'Premium',
    price: '$9.99 / month',
  },
  pro: {
    name: 'Pro',
    price: '$24.99 / month',
  },
};

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const planKey = searchParams.get('plan')?.toLowerCase() || '';
  const plan = paymentPlans[planKey];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-10 shadow-xl border border-gray-100">
        {plan ? (
          <>
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.2em] text-sky-600 font-semibold">Payment confirmed</p>
              <h1 className="mt-4 text-4xl font-bold text-gray-900">Ready to pay for {plan.name}</h1>
              <p className="mt-4 text-gray-600">Your selected plan is {plan.name} at {plan.price}. This page confirms the payment flow reached the confirmation step.</p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Link href="/dashboard" className="inline-flex justify-center rounded-full bg-sky-600 px-6 py-3 text-white font-semibold hover:bg-sky-700 transition">
                Return to Dashboard
              </Link>
              <Link href="/pricing" className="inline-flex justify-center rounded-full border border-sky-200 bg-white px-6 py-3 text-sky-700 font-semibold hover:bg-sky-50 transition">
                Change Plan
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">No plan selected</p>
            <p className="mt-3 text-gray-600">Please return to Pricing and choose Premium or Pro before continuing to payment.</p>
            <Link href="/pricing" className="mt-6 inline-flex rounded-full bg-sky-600 px-5 py-3 text-white font-medium hover:bg-sky-700 transition">
              Choose a plan
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
