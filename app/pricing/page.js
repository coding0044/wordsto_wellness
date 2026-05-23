'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useAuth';
import Link from 'next/link';
import PlanStatusBadge from '@/components/PlanStatusBadge';

function Navbar({ user }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200">
      <Link href="/dashboard" className="flex items-center gap-2">
        <svg className="w-6 h-6 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span className="text-xl font-light text-gray-700">Wordstowellness</span>
      </Link>

      <div className="hidden md:flex items-center gap-1">
        <Link href="/dashboard" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-light text-sm transition-colors">Dashboard</Link>
        <Link href="/dashboard-letters" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-light text-sm transition-colors">Browse letters</Link>
        <Link href="/search-feelings" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-light text-sm transition-colors">Search by feelings</Link>
        <Link href="/improve-message" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-light text-sm transition-colors">Improve my message</Link>
        <Link href="/pricing" className="px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-light text-sm">Pricing</Link>
      </div>

      <div className="flex items-center gap-3">
        <PlanStatusBadge user={user} />
        <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Log out
        </button>
      </div>
    </nav>
  );
}

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      'Browse all letter templates',
      'Search by feelings',
      'Basic letter customization',
      'Limited improvements per month',
      'Community support',
    ],
    cta: 'Current Plan',
    ctaStyle: 'opacity-50 cursor-not-allowed',
    color: 'sky',
  },
  {
    name: 'Premium',
    price: '$9.99',
    period: '/month',
    description: 'For serious letter writers',
    features: [
      'Everything in Free',
      'Unlimited letter improvements',
      'Advanced AI customization',
      'Priority support',
      'Save custom templates',
      'Export to PDF',
    ],
    cta: 'Upgrade to Premium',
    ctaStyle: 'bg-amber-500 hover:bg-amber-600 text-white',
    color: 'amber',
    popular: true,
  },
  {
    name: 'Pro',
    price: '$24.99',
    period: '/month',
    description: 'For professionals',
    features: [
      'Everything in Premium',
      'Unlimited API access',
      'Team collaboration',
      'Advanced analytics',
      'Dedicated account manager',
      'Custom integrations',
    ],
    cta: 'Upgrade to Pro',
    ctaStyle: 'bg-purple-500 hover:bg-purple-600 text-white',
    color: 'purple',
  },
];

function PricingCard({ plan, userPlan }) {
  const router = useRouter();
  const isCurrentPlan = userPlan?.toLowerCase() === plan.name.toLowerCase();

  const handleSelectPlan = () => {
    if (!isCurrentPlan) {
      router.push(`/payment?plan=${plan.name.toLowerCase()}`);
    }
  };
  
  return (
    <div className={`relative rounded-3xl border-2 overflow-hidden transition-all duration-300 ${
      plan.popular ? 'border-amber-200 bg-amber-50 lg:scale-105' : 'border-gray-200 bg-white'
    } shadow-lg hover:shadow-xl`}>
      {plan.popular && (
        <div className="absolute top-0 left-0 right-0 bg-amber-500 text-white text-center py-1 text-sm font-semibold">
          MOST POPULAR
        </div>
      )}
      
      <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
        <h3 className={`text-2xl font-bold mb-2 ${
          plan.color === 'amber' ? 'text-amber-600' :
          plan.color === 'purple' ? 'text-purple-600' :
          'text-sky-600'
        }`}>
          {plan.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
        
        <div className="mb-6">
          <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
          {plan.period && <span className="text-gray-600 ml-1">{plan.period}</span>}
        </div>

        <button
          onClick={handleSelectPlan}
          disabled={isCurrentPlan}
          className={`w-full py-3 rounded-full font-semibold mb-8 transition-colors duration-200 ${
            isCurrentPlan
              ? `bg-gray-100 text-gray-600 ${plan.ctaStyle}`
              : plan.ctaStyle
          }`}
        >
          {isCurrentPlan ? 'Current plan' : plan.cta}
        </button>

        <div className="space-y-4">
          <p className="text-xs text-gray-500 uppercase font-semibold">Includes:</p>
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                plan.color === 'amber' ? 'text-amber-500' :
                plan.color === 'purple' ? 'text-purple-500' :
                'text-sky-500'
              }`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 text-sm">{feature}</span>
            </div>


          ))}
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const { data: userData, isLoading, error } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      router.push('/login');
    }
  }, [error, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-center">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50">
      <Navbar user={userData} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/dashboard" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          <div className="text-center mb-12">
            <p className="text-sky-600 font-light uppercase tracking-wide mb-2">Flexible Pricing</p>
            <h1 className="text-5xl font-light text-gray-900 mb-4">Choose Your Plan</h1>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
              Select the perfect plan for your letter writing needs. Upgrade, downgrade, or cancel anytime.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <PricingCard 
              key={plan.name} 
              plan={plan} 
              userPlan={userData?.planName}
            />
          ))}
        </div>

        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h3>
              <p className="text-gray-600">Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">Yes, start with our free plan to explore all features. Upgrade to a paid plan whenever you are ready.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">We offer a 30-day money-back guarantee for annual plans. Contact support for more information.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
