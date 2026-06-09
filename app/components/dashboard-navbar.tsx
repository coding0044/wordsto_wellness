'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PlanStatusBadge from '@/components/plan-status-badge';
import { NAVIGATION } from '@/styles';

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
    <nav className={NAVIGATION.header}>
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2">
        <svg className="w-6 h-6 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span className="text-lg font-semibold text-slate-900">Wordstowellness</span>
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-2">
        <Link href="/dashboard" className={NAVIGATION.navLinkActive}>
          Dashboard
        </Link>
        <Link href="/dashboard-letters" className={NAVIGATION.navLink}>
          Browse letters
        </Link>
        <Link href="/search-feelings" className={NAVIGATION.navLink}>
          Search by feelings
        </Link>
        <Link href="/improve-message" className={NAVIGATION.navLink}>
          Improve my message
        </Link>
        <Link href="/pricing" className={NAVIGATION.navLink}>
          Pricing
        </Link>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-3">
        <PlanStatusBadge user={user} />
        <button
          onClick={onSettingsClick}
          className={NAVIGATION.navButton}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Settings
        </button>
      </div>
    </nav>
  );
}
