'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import Link from 'next/link';
import SettingsModal from '@/components/settings-modal';
import DashboardNavbar from '@/components/dashboard-navbar';
import {
  DASHBOARD_LAYOUT,
  DASHBOARD_LOADING,
  DASHBOARD_WELCOME,
  DASHBOARD_STATS,
  DASHBOARD_TOOLS,
  DASHBOARD_TOOL_CARD,
  DASHBOARD_BANNER,
} from '@/styles/dashboard-styles';

// Stats Card Component
function StatCard({ label, value, icon }) {
  const icons = {
    plan: (
      <svg className={DASHBOARD_STATS.iconPlan} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
    uses: (
      <svg className={DASHBOARD_STATS.iconUses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
      </svg>
    ),
    resets: (
      <svg className={DASHBOARD_STATS.iconResets} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    )
  };

  return (
    <div className={DASHBOARD_STATS.card}>
      <div className={DASHBOARD_STATS.cardHeader}>
        <span className={DASHBOARD_STATS.label}>{label}</span>
        {icons[icon]}
      </div>
      <div className={DASHBOARD_STATS.value}>{value}</div>
    </div>
  );
}

// Tool Card Component
function ToolCard({ title, description, icon, badge, href }) {
  const icons = {
    letters: (
      <div className={DASHBOARD_TOOL_CARD.iconLetters}>
        <svg className={DASHBOARD_TOOL_CARD.iconLettersIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      </div>
    ),
    search: (
      <div className={DASHBOARD_TOOL_CARD.iconSearch}>
        <svg className={DASHBOARD_TOOL_CARD.iconSearchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
    ),
    improve: (
      <div className={DASHBOARD_TOOL_CARD.iconImprove}>
        <svg className={DASHBOARD_TOOL_CARD.iconImproveIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
        </svg>
      </div>
    )
  };

  return (
    <Link href={href} className={DASHBOARD_TOOL_CARD.link}>
      <div className={DASHBOARD_TOOL_CARD.headerContainer}>
        {icons[icon]}
        <span className={DASHBOARD_TOOL_CARD.badge}>
          {badge}
        </span>
      </div>
      <h3 className={DASHBOARD_TOOL_CARD.title}>{title}</h3>
      <p className={DASHBOARD_TOOL_CARD.description}>{description}</p>
      <button className={DASHBOARD_TOOL_CARD.button}>
        Open
        <svg className={DASHBOARD_TOOL_CARD.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/>
        </svg>
      </button>
    </Link>
  );
}

function getUserPlanInfo(user) {
  const planName =
    user?.planName ||
    user?.plan?.name ||
    user?.subscription?.plan ||
    'Free';

  const planStatus =
    user?.planStatus ||
    user?.plan?.status ||
    user?.subscription?.status ||
    'Active';

  const usesLeft =
    user?.usesLeft ||
    user?.plan?.usesLeft ||
    user?.subscription?.usesLeft ||
    (planName.toLowerCase() === 'free' ? '1/3' : 'Unlimited');

  const resetFrequency =
    user?.resetFrequency ||
    user?.plan?.resetFrequency ||
    user?.subscription?.resetFrequency ||
    'Weekly';

  return { planName, planStatus, usesLeft, resetFrequency };
}

function getBannerTitle({ planName, planStatus, usesLeft }) {
  const planLabel =
    planName.toLowerCase() === 'free'
      ? 'Free Plan'
      : `${planName} Plan${planStatus ? ` · ${planStatus}` : ''}`;

  const usesLabel =
    usesLeft.toLowerCase().includes('unlimited')
      ? 'Unlimited uses'
      : `${usesLeft} left`;

  return `You're on ${planLabel} — ${usesLabel}`;
}

// Main Dashboard Content
function DashboardContent() {
  const [isClient, setIsClient] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { data: userData, isLoading: userLoading, error: userError } = useCurrentUser();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (userError) {
      router.push('/login');
    }
  }, [userError, router]);

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  const handleUserUpdate = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const planInfo = getUserPlanInfo(user || userData);
  const bannerTitle = getBannerTitle(planInfo);
  const isFreePlan = planInfo.planName.toLowerCase() === 'free';
  const bannerDescription = isFreePlan
    ? 'Upgrade to Premium for unlimited letters, refinements, and feeling-based search.'
    : 'Enjoy unlimited access to all letter tools and refinement features.';
  const ctaLabel = isFreePlan ? 'Upgrade' : 'Manage subscription';

  if (!isClient || userLoading) {
    return (
      <div className={DASHBOARD_LAYOUT.loadingContainer}>
        <div className={DASHBOARD_LOADING.content}>
          <div className={DASHBOARD_LOADING.spinner}></div>
          <p className={DASHBOARD_LOADING.text}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className={DASHBOARD_LAYOUT.container}>
      <DashboardNavbar user={user || userData} onSettingsClick={() => setShowSettings(true)} />
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        user={user}
        onUserUpdate={handleUserUpdate}
      />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className={DASHBOARD_WELCOME.container}>
          <p className={DASHBOARD_WELCOME.badge}>Welcome back</p>
          <div className={DASHBOARD_WELCOME.titleContainer}>
            <div>
              <h1 className={DASHBOARD_WELCOME.title}>
                Hello, {user?.name || 'User'}.
              </h1>
              <p className={DASHBOARD_WELCOME.subtitle}>Take a breath. What would you like to work on today?</p>
            </div>
            <div className={DASHBOARD_WELCOME.careTag}>
              <svg className={DASHBOARD_WELCOME.careIcon} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className={DASHBOARD_WELCOME.careText}>Writing with care</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={DASHBOARD_STATS.container}>
          <StatCard label="Plan" value={planInfo.planName} icon="plan" />
          <StatCard label="Uses Left" value={planInfo.usesLeft} icon="uses" />
          <StatCard label="Resets" value={planInfo.resetFrequency} icon="resets" />
        </div>

        {/* Tools Section */}
        <div className={DASHBOARD_TOOLS.container}>
          <div className={DASHBOARD_TOOLS.header}>
            <h2 className={DASHBOARD_TOOLS.title}>Your tools</h2>
            <span className={DASHBOARD_TOOLS.count}>3 features</span>
          </div>
          
          <div className={DASHBOARD_TOOLS.gridContainer}>
            <ToolCard
              title="Browse Letters"
              description="Explore therapeutic letters by category and topic."
              icon="letters"
              badge="Library"
              href="/dashboard-letters"
            />
            <ToolCard
              title="Search by Feelings"
              description="Describe how you feel and find matching letters."
              icon="search"
              badge="Discover"
              href="/search-feelings"
            />
            <ToolCard
              title="Improve My Message"
              description="Refine your message with AI while keeping your tone."
              icon="improve"
              badge="AI Tool"
              href="/improve-message"
            />
          </div>
        </div>

        {/* Plan Banner */}
        <div className={DASHBOARD_BANNER.container}>
          <div className={DASHBOARD_BANNER.contentWrapper}>
            <div className={DASHBOARD_BANNER.textSection}>
              <div className={DASHBOARD_BANNER.iconContainer}>
                <svg className={DASHBOARD_BANNER.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <h3 className={DASHBOARD_BANNER.title}>{bannerTitle}</h3>
                <p className={DASHBOARD_BANNER.description}>
                  {bannerDescription}
                </p>
                <div className={DASHBOARD_BANNER.progressContainer}>
                  <div className={DASHBOARD_BANNER.progressBar}></div>
                </div>
              </div>
            </div>
            <Link
              href="/pricing"
              className={DASHBOARD_BANNER.ctaButton}
            >
              {ctaLabel}
              <svg className={DASHBOARD_BANNER.ctaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}

// Main export with Suspense wrapper
export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className={DASHBOARD_LAYOUT.loadingContainer}>
        <div className={DASHBOARD_LOADING.content}>
          <div className={DASHBOARD_LOADING.spinner}></div>
          <p className={DASHBOARD_LOADING.text}>Loading your dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}