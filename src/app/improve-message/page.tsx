'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import Link from 'next/link';
import PlanStatusBadge from '@/components/plan-status-badge';
import {
  IMPROVE_MESSAGE_LAYOUT,
  IMPROVE_MESSAGE_LOADING,
  IMPROVE_MESSAGE_NAVBAR,
  IMPROVE_MESSAGE_CARD,
} from '@/styles/improve-message-styles';

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
    <nav className={IMPROVE_MESSAGE_NAVBAR.container}>
      <Link href="/dashboard" className={IMPROVE_MESSAGE_NAVBAR.logoLink}>
        <svg className={IMPROVE_MESSAGE_NAVBAR.logoSvg} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span className={IMPROVE_MESSAGE_NAVBAR.logoSpan}>Wordstowellness</span>
      </Link>

      <div className={IMPROVE_MESSAGE_NAVBAR.navLinks}>
        <Link href="/dashboard" className={IMPROVE_MESSAGE_NAVBAR.navLink}>Dashboard</Link>
        <Link href="/dashboard-letters" className={IMPROVE_MESSAGE_NAVBAR.navLink}>Browse letters</Link>
        <Link href="/search-feelings" className={IMPROVE_MESSAGE_NAVBAR.navLink}>Search by feelings</Link>
        <Link href="/improve-message" className={IMPROVE_MESSAGE_NAVBAR.navLinkActive}>Improve my message</Link>
        <Link href="/pricing" className={IMPROVE_MESSAGE_NAVBAR.navLink}>Pricing</Link>
      </div>

      <div className={IMPROVE_MESSAGE_NAVBAR.userActions}>
        <PlanStatusBadge user={user} />
        <button onClick={handleLogout} className={IMPROVE_MESSAGE_NAVBAR.logoutButton}>
          <svg className={IMPROVE_MESSAGE_NAVBAR.logoutIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Log out
        </button>
      </div>
    </nav>
  );
}

function ImproveMessagePage() {
  const [isClient, setIsClient] = useState(false);
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

  if (!isClient || userLoading) {
    return (
      <div className={IMPROVE_MESSAGE_LAYOUT.loadingContainer}>
        <div className={IMPROVE_MESSAGE_LOADING.content}>
          <div className={IMPROVE_MESSAGE_LOADING.spinner}></div>
          <p className={IMPROVE_MESSAGE_LOADING.text}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className={IMPROVE_MESSAGE_LAYOUT.container}>
      <Navbar user={userData} />

      <main className={IMPROVE_MESSAGE_LAYOUT.main}>
        <div className={IMPROVE_MESSAGE_CARD.container}>
          <div className={IMPROVE_MESSAGE_CARD.iconContainer}>
            <svg className={IMPROVE_MESSAGE_CARD.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3 0 .484.118.94.327 1.342L4.5 18l1.805 1.805 5.173-5.173A2.988 2.988 0 0012 16c1.657 0 3-1.343 3-3s-1.343-3-3-3zm0-7C6.477 1 2 5.477 2 11c0 2.256.756 4.334 2.026 6.004L2 20l3.996-2.034A9.973 9.973 0 0012 21c5.523 0 10-4.477 10-10S17.523 1 12 1z" />
            </svg>
          </div>
          <h1 className={IMPROVE_MESSAGE_CARD.title}>Improve your message</h1>
          <p className={IMPROVE_MESSAGE_CARD.description}>This tool will help you refine and strengthen your message soon. For now, use the letter library or search by feelings to find the right tone.</p>
          <div className={IMPROVE_MESSAGE_CARD.buttonContainer}>
            <Link href="/dashboard-letters" className={IMPROVE_MESSAGE_CARD.primaryButton}>
              Browse letters
            </Link>
            <Link href="/search-feelings" className={IMPROVE_MESSAGE_CARD.secondaryButton}>
              Search by feelings
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ImproveMessagePageWrapper() {
  return (
    <Suspense fallback={
      <div className={IMPROVE_MESSAGE_LAYOUT.loadingContainer}>
        <div className={IMPROVE_MESSAGE_LOADING.content}>
          <div className={IMPROVE_MESSAGE_LOADING.spinner}></div>
          <p className={IMPROVE_MESSAGE_LOADING.text}>Loading page...</p>
        </div>
      </div>
    }>
      <ImproveMessagePage />
    </Suspense>
  );
}