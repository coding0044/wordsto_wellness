'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth.ts';
import Link from 'next/link';
import PlanStatusBadge from '../../components/PlanStatusBadge';

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
    <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <Link href="/dashboard" className="flex items-center gap-2">
        <svg className="w-6 h-6 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span className="text-xl font-light text-gray-700">Wordstowellness</span>
      </Link>

      <div className="hidden md:flex items-center gap-1">
        <Link href="/dashboard" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">Dashboard</Link>
        <Link href="/dashboard-letters" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">Browse letters</Link>
        <Link href="/search-feelings" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">Search by feelings</Link>
        <Link href="/improve-message" className="px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-medium text-sm">Improve my message</Link>
        <Link href="/pricing" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">Pricing</Link>
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
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-center">Loading...</p>
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

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-700 shadow-sm">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3 0 .484.118.94.327 1.342L4.5 18l1.805 1.805 5.173-5.173A2.988 2.988 0 0012 16c1.657 0 3-1.343 3-3s-1.343-3-3-3zm0-7C6.477 1 2 5.477 2 11c0 2.256.756 4.334 2.026 6.004L2 20l3.996-2.034A9.973 9.973 0 0012 21c5.523 0 10-4.477 10-10S17.523 1 12 1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Improve your message</h1>
          <p className="text-gray-600 mb-8">This tool will help you refine and strengthen your message soon. For now, use the letter library or search by feelings to find the right tone.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard-letters" className="px-6 py-3 rounded-full bg-sky-600 text-white font-semibold hover:bg-sky-700 transition">Browse letters</Link>
            <Link href="/search-feelings" className="px-6 py-3 rounded-full border border-sky-200 text-sky-700 font-semibold hover:bg-sky-50 transition">Search by feelings</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ImproveMessagePageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-center">Loading page...</p>
        </div>
      </div>
    }>
      <ImproveMessagePage />
    </Suspense>
  );
}
