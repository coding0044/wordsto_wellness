'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import Link from 'next/link';
import { ApiRoutes, Routes } from '@/lib/urls';
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
} from '@/styles';

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
      <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
        <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      </div>
    ),
    search: (
      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
    ),
    improve: (
      <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
        <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
        </svg>
      </div>
    )
  };

  return (
    <Link href={href} className="group block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-sky-200 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        {icons[icon]}
        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium uppercase tracking-wide">
          {badge}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors">{title}</h3>
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">{description}</p>
      <button className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors">
        Open
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

function getPlanBadgeLabel(user) {
  const planName =
    user?.planName ||
    user?.plan?.name ||
    user?.subscription?.plan ||
    'Free';

  return planName.toLowerCase() === 'free' ? 'Free plan' : `${planName} plan`;
}

function getBannerTitle({ planName, planStatus, usesLeft }) {
  const planLabel =
    planName.toLowerCase() === 'free'
      ? 'Free Plan'
      : `${planName} Plan${planStatus ? ` · ${planStatus}` : ''}`;

  const usesLabel =
    String(usesLeft).toLowerCase().includes('unlimited')
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
      router.push(Routes.auth.login);
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
    ? 'Upgrade to Premium or Expert for unlimited letters, refinements, and feeling-based search.'
    : 'Enjoy unlimited access to all letter tools and refinement features.';
  const ctaLabel = isFreePlan ? 'Upgrade' : 'Manage subscription';

  if (!isClient || userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-center">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50">
      <DashboardNavbar user={user || userData} onSettingsClick={() => setShowSettings(true)} />
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        user={user}
        onUserUpdate={handleUserUpdate}
      />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <p className="text-sky-600 font-medium mb-1">Welcome back</p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Hello, {user?.name || 'User'}.
              </h1>
              <p className="text-gray-600">Take a breath. What would you like to work on today?</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
              <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">Writing with care</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <StatCard label="Plan" value={planInfo.planName} icon="plan" />
          <StatCard label="Uses Left" value={planInfo.usesLeft} icon="uses" />
          <StatCard label="Resets" value={planInfo.resetFrequency} icon="resets" />
        </div>

        {/* Tools Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Your tools</h2>
            <span className="text-sm text-gray-500">3 features</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Free Plan Banner */}
        <div className="mt-10 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{bannerTitle}</h3>
                <p className="text-sm text-gray-600 max-w-md">
                  {bannerDescription}
                </p>
                <div className="mt-3 w-32 h-1.5 bg-white rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-sky-500 rounded-full"></div>
                </div>
              </div>
            </div>
            <Link
              href="/pricing"
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-colors"
            >
              {ctaLabel}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-center">Loading your dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
