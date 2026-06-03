'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import { useContentTree, useLettersByTopic } from '@/hooks/use-content';
import Link from 'next/link';
import { normalizeEntityId } from '@/lib/api-utils';
import PlanStatusBadge from '@/components/plan-status-badge';

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

function getLetterCategory(letterType) {
  return letterCategoryMap[String(letterType || '').toUpperCase()] || defaultLetterCategory;
}

function getLetterLevel(level) {
  return letterLevelMap[String(level || '').toLowerCase()] || defaultLetterLevel;
}

// Navigation Component
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
        <span className="text-xl font-semibold text-gray-800">Wordstowellness</span>
      </Link>

      <div className="hidden md:flex items-center gap-1">
        <Link href="/dashboard" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">Dashboard</Link>
        <Link href="/dashboard-letters" className="px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-medium text-sm">Browse letters</Link>
        <Link href="/search-feelings" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors">Search by feelings</Link>
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

// Locked Letter Card Component for Free Users
function LockedLetterCard() {
  const router = useRouter();

  return (
    <div className="group block bg-white/70 rounded-2xl p-6 shadow-sm border border-gray-100 opacity-80">
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-2xl shadow-md">
          🔒
        </div>
        <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold uppercase tracking-wide">Locked</span>
      </div>
      <div className="h-7 bg-gray-200 rounded-lg w-3/4 mb-3 animate-pulse"></div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-400">Premium content</span>
        <button
          onClick={() => router.push('/pricing')}
          className="flex items-center space-x-1 text-amber-600 font-semibold text-sm hover:translate-x-1 transition-transform"
        >
          <span>Upgrade to unlock</span>
          <span>🔓</span>
        </button>
      </div>
    </div>
  );
}

function LetterCard({ letter }) {
  const category = getLetterCategory(letter.letter_type);
  const level = getLetterLevel(letter.level);

  return (
    <div className={`group block bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 border-l-8 ${category.borderClass}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 leading-snug md:text-base">
            {category.title}
          </p>
        </div>
        <span className={`inline-flex flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${level.badgeClass}`}>
          {level.label}
        </span>
      </div>

      <h4 className="text-xl font-semibold text-slate-900 mb-3 line-clamp-2">{letter.title}</h4>
      {letter.content && (
        <p className="text-sm text-gray-600 mb-5 line-clamp-4 leading-relaxed">{letter.content}</p>
      )}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{formatDate(letter.createdAt)}</span>
        <button className="font-semibold text-slate-700 hover:text-slate-900 transition">
          Read More →
        </button>
      </div>
    </div>
  );
}

// Main Letters View Content
function LettersViewContent() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicId = searchParams.get('topic') || searchParams.get('topicId');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: userData, isLoading: userLoading, error: userError } = useCurrentUser();
  const { data: contentTreeData, isLoading: contentTreeLoading } = useContentTree();
  const { data: lettersByTopic, isLoading: lettersByTopicLoading } = useLettersByTopic(topicId || '');

  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (userError) router.push('/login');
  }, [userError, router]);

  useEffect(() => {
    if (!topicId && isClient) {
      router.push('/dashboard-letters');
    }
  }, [topicId, isClient, router]);

  const categories = Array.isArray(contentTreeData) ? contentTreeData : [];
  const subcategories = categories.flatMap((category) => category.subcategories || []);
  const topics = subcategories.flatMap((subcategory) => subcategory.topics || []);
const normalizedTopicId = normalizeEntityId(topicId);
  const currentTopic = topics.find((t) => normalizeEntityId(t) === normalizedTopicId);
  const letters = (currentTopic?.letters && currentTopic.letters.length > 0)
    ? currentTopic.letters
    : (Array.isArray(lettersByTopic) ? lettersByTopic : []);

  // Find parent category and subcategory for breadcrumb
  let currentCategory = null;
  let currentSubcategory = null;

  for (const category of categories) {
    for (const subcategory of category.subcategories || []) {
      if (subcategory.topics?.some((t) => normalizeEntityId(t) === normalizedTopicId)) {
        currentCategory = category;
        currentSubcategory = subcategory;
        break;
      }
    }
    if (currentCategory) break;
  }

  const sortedLetters = [...letters].sort((a, b) => {
    const typeA = String(a?.letter_type || '').toUpperCase();
    const typeB = String(b?.letter_type || '').toUpperCase();
    
    // First sort by letter_type (A, B, C, etc.)
    if (typeA !== typeB) {
      return typeA.localeCompare(typeB);
    }
    
    // Then sort by level (a, b, c) within the same letter_type
    const levelA = String(a?.level || '').toLowerCase();
    const levelB = String(b?.level || '').toLowerCase();
    return levelA.localeCompare(levelB);
  });

  const filteredLetters = sortedLetters.filter(letter =>
    letter.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    letter.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const currentTopicDisplayName = currentTopic?.name || (topicId ? `Topic ${topicId}` : 'Letters');
  const userPlan = userData?.planName?.toLowerCase() || 'free';
  const hasPaidAccess = userPlan === 'premium' || userPlan === 'expert' || userPlan === 'pro';

  if (!isClient || userLoading || (topicId && lettersByTopicLoading)) {
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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
          <Link href="/dashboard" className="text-gray-500 hover:text-sky-600 transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href="/dashboard-letters" className="text-gray-500 hover:text-sky-600 transition-colors">Letters</Link>
          {currentCategory && (
            <>
              <span>/</span>
              <Link href={`/dashboard-subcategories?cat=${normalizeEntityId(currentCategory)}`} className="text-gray-500 hover:text-sky-600 transition-colors font-medium">{currentCategory.name}</Link>
            </>
          )}
          {currentSubcategory && (
            <>
              <span>/</span>
              <Link href={`/dashboard-topics?sub=${normalizeEntityId(currentSubcategory)}`} className="text-gray-500 hover:text-sky-600 transition-colors font-medium">{currentSubcategory.name}</Link>
            </>
          )}
          {currentTopic && (
            <>
              <span>/</span>
              <span className="text-gray-900 font-semibold">{currentTopicDisplayName}</span>
            </>
          )}
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href={currentCategory ? `/dashboard-subcategories?cat=${normalizeEntityId(currentCategory)}` : '/dashboard-letters'} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Back
            </Link>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-2xl shadow-md">
              📄
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{currentTopicDisplayName}</h1>
              <p className="text-gray-600">{letters.length} letters available</p>
              {!hasPaidAccess && (
                <p className="text-amber-600 text-sm mt-1 flex items-center gap-1">
                  <span>🔒</span> Upgrade to Premium or Expert to unlock all letters
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search letters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-5 py-3.5 text-base border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white"
          />
        </div>

        {/* Letters Grid */}
        {contentTreeLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="space-y-4">
              <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 text-center">Loading letters...</p>
            </div>
          </div>
        ) : filteredLetters.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center text-4xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{searchQuery ? 'No letters found' : 'No letters available'}</h3>
            <p className="text-gray-600">{searchQuery ? 'Try a different search term' : 'Letters will appear here once they\'re added.'}</p>
          </div>
        ) : hasPaidAccess ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLetters.map((letter) => (
              <LetterCard key={letter._id} letter={letter} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: Math.max(filteredLetters.length, 3) }).map((_, index) => (
                <LockedLetterCard key={`locked-${index}`} />
              ))}
            </div>
            <div className="text-center mt-8">
              <button
                onClick={() => router.push('/pricing')}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Upgrade to Premium or Expert to unlock all letters →
              </button>
            </div>
          </>
        )}

      </main>
    </div>
  );
}

export default function LettersViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-center">Loading...</p>
        </div>
      </div>
    }>
      <LettersViewContent />
    </Suspense>
  );
}
