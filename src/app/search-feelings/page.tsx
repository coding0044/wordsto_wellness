'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import { useContentTree } from '@/hooks/use-content';
import Link from 'next/link';
import PlanStatusBadge from '../../components/PlanStatusBadge';

function formatDate(value) {
  if (!value) return '';
  let d = new Date(value);
  if (isNaN(d.getTime())) {
    const alt = String(value).replace(' ', 'T');
    d = new Date(alt);
    if (isNaN(d.getTime())) {
      const m = String(value).match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
      if (m) d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
    }
  }
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
}

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
        <Link href="/search-feelings" className="px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-medium text-sm">Search by feelings</Link>
        <Link href="/improve-message" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">Improve my message</Link>
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

function SearchByFeelingsPage() {
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { data: userData, isLoading: userLoading, error: userError } = useCurrentUser();
  const { data: contentTreeData, isLoading: contentTreeLoading } = useContentTree();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (userError) {
      router.push('/login');
    }
  }, [userError, router]);

  const categories = Array.isArray(contentTreeData) ? contentTreeData : [];
  const letters = categories.flatMap((category) =>
    (category.subcategories || []).flatMap((subcategory) =>
      (subcategory.topics || []).flatMap((topic) =>
        (topic.letters || []).map((letter) => ({
          ...letter,
          topic,
          subcategory,
          category,
        }))
      )
    )
  );

  const normalizedInput = searchQuery.trim().toLowerCase();
  const filteredLetters = normalizedInput
    ? letters.filter((letter) => {
        const checks = [
          letter.title,
          letter.content,
          letter.topic?.name,
          letter.topic?.description,
          letter.subcategory?.name,
          letter.category?.name,
          letter.letter_type,
          letter.level,
        ];
        return checks.some((value) =>
          String(value || '').toLowerCase().includes(normalizedInput)
        );
      })
    : [];

  if (!isClient || userLoading || contentTreeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-center">Loading search data...</p>
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

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/dashboard" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="max-w-3xl">
                <p className="text-sky-600 font-medium uppercase tracking-wide mb-2">Search by feelings</p>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Find letters that match your mood.</h1>
                <p className="text-gray-600 leading-relaxed">
                  Enter how you feel or what you want to say, and we&apos;ll surface the most relevant letters from the library.
                </p>
              </div>
              <div className="rounded-3xl bg-sky-50 p-4 text-sky-700 text-sm font-medium">
                {letters.length} letters searchable across {categories.length} categories
              </div>
            </div>

            <div className="mt-8 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search feelings, tone, topic, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-3xl border border-gray-200 bg-white py-4 pl-14 pr-5 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 transition"
              />
            </div>
          </div>
        </div>

        {!normalizedInput ? (
          <div className="rounded-3xl bg-white p-10 shadow-sm border border-gray-100 text-center">
            <p className="text-lg font-semibold text-gray-900 mb-2">Start with a feeling or keyword</p>
            <p className="text-gray-600">Try words like &quot;hopeful&quot;, &quot;healing&quot;, &quot;confused&quot;, or &quot;grief&quot; to find letters that resonate.</p>
          </div>
        ) : filteredLetters.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 shadow-sm border border-gray-100 text-center">
            <p className="text-xl font-semibold text-gray-900 mb-3">No matches found</p>
            <p className="text-gray-600">Try a different feeling, topic, or emotion.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLetters.map((letter) => (
              <div key={letter._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-sm font-semibold text-sky-600">{letter.topic?.name || 'Letter'}</span>
                  <span className="text-xs text-gray-500">{letter.category?.name || letter.subcategory?.name || 'Unknown'}</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">{letter.title || 'Untitled letter'}</h2>
                <p className="text-sm text-gray-600 mb-5 line-clamp-4">{letter.content || 'No description available.'}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{letter.subcategory?.name || 'Unknown topic'}</span>
                  <span>{formatDate(letter.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchByFeelingsPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-center">Loading search page...</p>
        </div>
      </div>
    }>
      <SearchByFeelingsPage />
    </Suspense>
  );
}
