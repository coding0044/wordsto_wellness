'use client';
import { useEffect, useState, Suspense, useCallback, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import Link from 'next/link';
import PlanStatusBadge from '@/components/plan-status-badge';

interface NavbarProps {
  user: any;
}

function Navbar({ user }: NavbarProps) {
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

interface SearchResult {
  _id: string;
  title: string;
  content: string;
  letter_type: string;
  level: string;
  createdAt: string;
  score: number;
  topic: { _id: string; name: string } | null;
  subcategory: { _id: string; name: string } | null;
  category: { _id: string; name: string } | null;
}

function RelevanceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? 'bg-green-400' : pct >= 50 ? 'bg-sky-400' : 'bg-gray-300';
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-12 text-right">{pct}%</span>
    </div>
  );
}

function formatDate(value: string | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric' });
}

const letterCategoryMap = {
  A: { title: 'General Confrontation Letters', borderClass: 'border-sky-500', pillClass: 'bg-sky-50 text-sky-700' },
  B: { title: 'Professional Treatment', borderClass: 'border-orange-500', pillClass: 'bg-orange-50 text-orange-700' },
  C: { title: 'Follow-up Treatment', borderClass: 'border-violet-500', pillClass: 'bg-violet-50 text-violet-700' },
  D: { title: 'Apology Letter', borderClass: 'border-emerald-500', pillClass: 'bg-emerald-50 text-emerald-700' },
  E: { title: 'Defending/Denying', borderClass: 'border-red-500', pillClass: 'bg-red-50 text-red-700' },
  F: { title: 'Forgiveness', borderClass: 'border-teal-500', pillClass: 'bg-teal-50 text-teal-700' },
  G: { title: 'Motivation & Support', borderClass: 'border-amber-500', pillClass: 'bg-amber-50 text-amber-700' },
  H: { title: 'Self Disclosure', borderClass: 'border-pink-500', pillClass: 'bg-pink-50 text-pink-700' },
  I: { title: 'Congratulations', borderClass: 'border-emerald-500', pillClass: 'bg-emerald-50 text-emerald-700' },
};

const letterLevelMap = {
  a: { label: 'Level I', badgeClass: 'bg-emerald-100 text-emerald-700' },
  b: { label: 'Level II', badgeClass: 'bg-amber-100 text-amber-800' },
  c: { label: 'Level III', badgeClass: 'bg-red-100 text-red-700' },
};

const defaultLetterCategory = { title: 'General Letter', borderClass: 'border-gray-300', pillClass: 'bg-gray-100 text-gray-700' };
const defaultLetterLevel = { label: 'Level', badgeClass: 'bg-gray-100 text-gray-700' };

function getLetterCategory(letterType: string) {
  return letterCategoryMap[String(letterType || '').toUpperCase() as keyof typeof letterCategoryMap] || defaultLetterCategory;
}

function getLetterLevel(level: string) {
  return letterLevelMap[String(level || '').toLowerCase() as keyof typeof letterLevelMap] || defaultLetterLevel;
}

function SearchByFeelingsPage() {
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: userData, isLoading: userLoading, error: userError } = useCurrentUser();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (userError) router.push('/login');
  }, [userError, router]);

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim();
    if (!query || query.length < 2) return;

    setIsSearching(true);
    setError('');
    setSearched(false);

    try {
      const res = await fetch('/api/public/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 12 }),
      });

      const data = await res.json();
      // Debugging: log API status and payload so we can inspect why frontend shows no results
      // Check browser console (F12) and Network tab for the request/response details.
      // Remove these logs after debugging.
      // eslint-disable-next-line no-console
      console.debug('[semantic-search] status', res.status, 'data', data);

      if (!res.ok) {
        setError(data.error || 'Search failed. Please try again.');
        setResults([]);
      } else {
        setResults(data.results || []);
        setSearched(true);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

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

  if (!userData) return null;

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
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sky-600 font-medium uppercase tracking-wide text-sm">Semantic Search</span>
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-xs rounded-full font-medium">AI Powered</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Find letters that match your situation.</h1>
                <p className="text-gray-600 leading-relaxed">
                  Describe how you feel or what you&apos;re going through in your own words. Our AI understands meaning — not just keywords — and finds the most relevant letters for you.
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="e.g. I feel lost and don't know how to talk to my mom about my anxiety..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="block w-full rounded-3xl border border-gray-200 bg-white py-4 pl-14 pr-5 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 transition"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-4 bg-sky-600 text-white font-semibold rounded-3xl hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Find Letters'
                )}
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-400 pl-4">
              Try: &quot;I want to reconnect with an old friend&quot; · &quot;I need to apologize to someone I hurt&quot; · &quot;feeling anxious about a big change&quot;
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-3xl bg-red-50 border border-red-100 p-6 text-center mb-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {isSearching && (
          <div className="rounded-3xl bg-white p-10 shadow-sm border border-gray-100 text-center">
            <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Analyzing your situation and finding relevant letters...</p>
            <p className="text-gray-400 text-sm mt-1">This may take a few seconds on first search</p>
          </div>
        )}

        {!isSearching && !searched && !error && (
          <div className="rounded-3xl bg-white p-10 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">Describe your situation in your own words</p>
            <p className="text-gray-500 text-sm max-w-md mx-auto">Our AI understands context and meaning. You don&apos;t need to use exact keywords � just say what&apos;s on your mind.</p>
          </div>
        )}

        {!isSearching && searched && results.length === 0 && !error && (
          <div className="rounded-3xl bg-white p-10 shadow-sm border border-gray-100 text-center">
            <p className="text-xl font-semibold text-gray-900 mb-3">No close matches found</p>
            <p className="text-gray-500">Try describing your situation differently or use different words.</p>
          </div>
        )}

        {!isSearching && results.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-gray-600 text-sm">
                Found <span className="font-semibold text-gray-900">{results.length}</span> relevant letters for &quot;<span className="text-sky-600">{searchQuery}</span>&quot;
              </p>
              <span className="text-xs text-gray-400">Sorted by relevance</span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.map((letter) => {
                const category = getLetterCategory(letter.letter_type);
                const level = getLetterLevel(letter.level);
                return (
                  <div key={letter._id} className={`bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition flex flex-col border-l-8 ${category.borderClass}`}>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${category.pillClass}`}>{category.title}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${level.badgeClass}`}>{level.label}</span>
                    </div>
                    <div className="mb-3">
                      <h2 className="text-base font-semibold text-slate-900 line-clamp-2">{letter.title}</h2>
                    </div>

                    <p className="text-sm text-gray-600 mb-5 line-clamp-4 break-words">{letter.content || 'No content available.'}</p>

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    
                      <span className="text-sky-600 font-medium">{letter.topic?.name || ''}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <RelevanceBar score={letter.score} />
                      <button
                        type="button"
                        onClick={() => setSelectedLetter(letter)}
                        className="text-sky-600 font-semibold text-sm hover:text-sky-700 transition"
                      >
                        Read Full Letter →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {selectedLetter && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedLetter(null)}>
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedLetter.title}</h2>
                  <p className="text-sm text-gray-500 mt-2">{selectedLetter.topic?.name || getLetterCategory(selectedLetter.letter_type).title}</p>
                </div>
                <button
                  onClick={() => setSelectedLetter(null)}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                  aria-label="Close full letter"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-90px)] prose prose-slate max-w-none text-gray-700">
                <div className="whitespace-pre-wrap">{selectedLetter.content}</div>
              </div>
            </div>
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