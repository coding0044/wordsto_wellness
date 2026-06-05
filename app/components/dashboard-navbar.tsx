'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PlanStatusBadge from '@/components/plan-status-badge';
import { DASHBOARD_NAVBAR } from '@/styles';

export default function DashboardNavbar({ user, onSettingsClick }) {
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
    <nav className={DASHBOARD_NAVBAR.container}>
      {/* Logo */}
      <Link href="/dashboard" className={DASHBOARD_NAVBAR.logo}>
        <svg className={DASHBOARD_NAVBAR.logoIcon} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span className={DASHBOARD_NAVBAR.logoText}>Wordstowellness</span>
      </Link>

      {/* Navigation Links */}
      <div className={DASHBOARD_NAVBAR.linksContainer}>
        <Link href="/dashboard" className={DASHBOARD_NAVBAR.linkActive}>
          Dashboard
        </Link>
        <Link href="/dashboard-letters" className={DASHBOARD_NAVBAR.linkInactive}>
          Browse letters
        </Link>
        <Link href="/search-feelings" className={DASHBOARD_NAVBAR.linkInactive}>
          Search by feelings
        </Link>
        <Link href="/improve-message" className={DASHBOARD_NAVBAR.linkInactive}>
          Improve my message
        </Link>
        <Link href="/pricing" className={DASHBOARD_NAVBAR.linkInactive}>
          Pricing
        </Link>
      </div>

      {/* User Actions */}
      <div className={DASHBOARD_NAVBAR.userActionsContainer}>
        <PlanStatusBadge user={user} />
        <button
          onClick={onSettingsClick}
          className={DASHBOARD_NAVBAR.settingsButton}
        >
          <svg className={DASHBOARD_NAVBAR.settingsIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Settings
        </button>
      </div>
    </nav>
  );
}
