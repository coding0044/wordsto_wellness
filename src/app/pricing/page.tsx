'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import Link from 'next/link';
import PlanStatusBadge from '@/components/plan-status-badge';
import {
  PRICING_LAYOUT,
  PRICING_LOADING,
  PRICING_NAVBAR,
  PRICING_HEADER,
  PRICING_CARD,
  PRICING_FAQ,
} from '@/styles/pricing-styles';

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
    <nav className={PRICING_NAVBAR.container}>
      <Link href="/dashboard" className={PRICING_NAVBAR.logoLink}>
        <svg className={PRICING_NAVBAR.logoSvg} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span className={PRICING_NAVBAR.logoSpan}>Wordstowellness</span>
      </Link>

      <div className={PRICING_NAVBAR.navLinks}>
        <Link href="/dashboard" className={PRICING_NAVBAR.navLink}>Dashboard</Link>
        <Link href="/dashboard-letters" className={PRICING_NAVBAR.navLink}>Browse letters</Link>
        <Link href="/search-feelings" className={PRICING_NAVBAR.navLink}>Search by feelings</Link>
        <Link href="/improve-message" className={PRICING_NAVBAR.navLink}>Improve my message</Link>
        <Link href="/pricing" className={PRICING_NAVBAR.navLinkActive}>Pricing</Link>
      </div>

      <div className={PRICING_NAVBAR.userActions}>
        <PlanStatusBadge user={user} />
        <button onClick={handleLogout} className={PRICING_NAVBAR.logoutButton}>
          <svg className={PRICING_NAVBAR.logoutIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    cta: 'Choose Free',
    ctaStyle: 'bg-sky-500 hover:bg-sky-600 text-white',
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
    name: 'Expert',
    price: '$24.99',
    period: '/month',
    description: 'For professionals and expert writers',
    features: [
      'Everything in Premium',
      'Unlimited API access',
      'Team collaboration',
      'Advanced analytics',
      'Dedicated account manager',
      'Custom integrations',
    ],
    cta: 'Upgrade to Expert',
    ctaStyle: 'bg-purple-500 hover:bg-purple-600 text-white',
    color: 'purple',
  },
];

function PricingCard({ plan, userPlan }) {
  const router = useRouter();
  const isCurrentPlan = userPlan?.toLowerCase() === plan.name.toLowerCase();
  const buttonLabel = isCurrentPlan
    ? 'Current plan'
    : plan.name === 'Free'
    ? 'Switch to Free'
    : plan.cta;

  const handleSelectPlan = () => {
    if (!isCurrentPlan) {
      router.push(`/payment?plan=${plan.name.toLowerCase()}`);
    }
  };
  
  return (
    <div className={PRICING_CARD.container(plan.popular, plan.color)}>
      {plan.popular && (
        <div className={PRICING_CARD.popularBadge}>
          MOST POPULAR
        </div>
      )}
      
      <div className={PRICING_CARD.contentContainer(plan.popular)}>
        <h3 className={PRICING_CARD.title(plan.color)}>
          {plan.name}
        </h3>
        
        <p className={PRICING_CARD.description}>{plan.description}</p>
        
        <div className={PRICING_CARD.priceContainer}>
          <span className={PRICING_CARD.price}>{plan.price}</span>
          {plan.period && <span className={PRICING_CARD.pricePeriod}>{plan.period}</span>}
        </div>

        <button
          onClick={handleSelectPlan}
          disabled={isCurrentPlan}
          className={PRICING_CARD.button(isCurrentPlan, plan.ctaStyle)}
        >
          {buttonLabel}
        </button>

        <div className={PRICING_CARD.featuresContainer}>
          <p className={PRICING_CARD.featuresTitle}>Includes:</p>
          {plan.features.map((feature, idx) => (
            <div key={idx} className={PRICING_CARD.featureItem}>
              <svg className={PRICING_CARD.featureIcon(plan.color)} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className={PRICING_CARD.featureText}>{feature}</span>
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
      <div className={PRICING_LAYOUT.loadingContainer}>
        <div className={PRICING_LOADING.content}>
          <div className={PRICING_LOADING.spinner}></div>
          <p className={PRICING_LOADING.text}>Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className={PRICING_LAYOUT.container}>
      <Navbar user={userData} />

      <main className={PRICING_LAYOUT.main}>
        <div className={PRICING_HEADER.container}>
          <div className={PRICING_HEADER.backButton}>
            <Link href="/dashboard" className={PRICING_HEADER.backButtonInner}>
              <svg className={PRICING_HEADER.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          <div className={PRICING_HEADER.textContainer}>
            <p className={PRICING_HEADER.badge}>Flexible Pricing</p>
            <h1 className={PRICING_HEADER.title}>Choose Your Plan</h1>
            <p className={PRICING_HEADER.description}>
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

        {/* FAQ Section */}
        <div className={PRICING_FAQ.container}>
          <h2 className={PRICING_FAQ.title}>Frequently Asked Questions</h2>
          
          <div className={PRICING_FAQ.questionContainer}>
            <div>
              <h3 className={PRICING_FAQ.questionTitle}>Can I change my plan anytime?</h3>
              <p className={PRICING_FAQ.questionAnswer}>Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately.</p>
            </div>
            
            <div>
              <h3 className={PRICING_FAQ.questionTitle}>Is there a free trial?</h3>
              <p className={PRICING_FAQ.questionAnswer}>Yes, start with our free plan to explore all features. This is come to subscription when you&apos;re ready.</p>
            </div>
            
            <div>
              <h3 className={PRICING_FAQ.questionTitle}>Do you offer refunds?</h3>
              <p className={PRICING_FAQ.questionAnswer}>We offer a 30-day money-back guarantee for annual plans. Contact support for more information.</p>
            </div>
            
            <div>
              <h3 className={PRICING_FAQ.questionTitle}>What payment methods do you accept?</h3>
              <p className={PRICING_FAQ.questionAnswer}>We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}