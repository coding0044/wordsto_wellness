'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import { useContentTree, useLettersByTopic } from '@/hooks/use-content';
import Link from 'next/link';
import { ApiRoutes, Routes } from '@/lib/urls';
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
  A: { title: 'Confront or Hold Someone Accountable ', borderClass: 'border-sky-500', pillClass: 'bg-sky-50 text-sky-700', description: 'Express concerns or address issues directly' },
  B: { title: 'Take Responsibility and Apologize for this Problem', borderClass: 'border-orange-500', pillClass: 'bg-orange-50 text-orange-700', description: 'For workplace or professional relationships' },
  C: { title: 'Defend or Deny this Problem', borderClass: 'border-violet-500', pillClass: 'bg-violet-50 text-violet-700', description: 'Continue important conversations' },
  D: { title: 'Forgive Someone for this Problem', borderClass: 'border-emerald-500', pillClass: 'bg-emerald-50 text-emerald-700', description: 'Make amends and rebuild trust' },
  E: { title: 'Encourage, Motivate or Support Someone Having This Problem', borderClass: 'border-red-500', pillClass: 'bg-red-50 text-red-700', description: 'Share your side of the story' },
  F: { title: 'Self-Disclosure of this Problem', borderClass: 'border-teal-500', pillClass: 'bg-teal-50 text-teal-700', description: 'Let go and move forward' },
  G: { title: 'Congratulate or Thank Someone', borderClass: 'border-amber-500', pillClass: 'bg-amber-50 text-amber-700', description: 'Encourage and uplift others' },
};

const letterLevelMap = {
  a: { label: 'Level I - Beginner', badgeClass: 'bg-emerald-100 text-emerald-700', description: 'Simple, straightforward templates' },
  b: { label: 'Level II - Intermediate', badgeClass: 'bg-amber-100 text-amber-800', description: 'More detailed and nuanced' },
  c: { label: 'Level III - Advanced', badgeClass: 'bg-red-100 text-red-700', description: 'Complex situations and deep emotions' },
};

const defaultLetterCategory = { title: 'General Letter', borderClass: 'border-gray-300', pillClass: 'bg-gray-100 text-gray-700' };
const defaultLetterLevel = { label: 'No Level', badgeClass: 'bg-gray-100 text-gray-700' };

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
      await fetch(ApiRoutes.auth.logout, { method: 'POST' });
      router.push(Routes.auth.login);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <Link href="/dashboard" className="flex items-center gap-2">
        <svg className="w-6 h-6 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span className="text-xl font-light text-gray-700">Words to Wellness</span>
      </Link>

      <div className="hidden md:flex items-center gap-1">
        <Link href="/dashboard" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-light text-sm transition-colors">Dashboard</Link>
        <Link href="/dashboard-letters" className="px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-light text-sm">Browse Letters</Link>
        <Link href="/search-feelings" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-light text-sm transition-colors">Search by Feelings</Link>
        <Link href="/improve-message" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-light text-sm transition-colors">Improve My Message</Link>
        <Link href="/pricing" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-light text-sm transition-colors">Pricing</Link>
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
function LockedLetterCard({ letterInfo }) {
  const router = useRouter();
  
  return (
    <div className="group block bg-white/60 rounded-2xl p-6 shadow-sm border-2 border-dashed border-amber-200 opacity-90 hover:opacity-100 transition-opacity">
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white text-2xl shadow-md">
          🔒
        </div>
        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold uppercase tracking-wide flex items-center gap-1">
          <span>🔐</span> Premium Content
        </span>
      </div>
      <h4 className="text-xl font-semibold text-gray-800 mb-2">{letterInfo?.title || 'Premium Letter Template'}</h4>
      <p className="text-sm text-gray-500 mb-4">
        {letterInfo?.content?.substring(0, 100) || 'Professional letter templates to help you communicate effectively in difficult situations.'}...
      </p>
      <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-600 font-medium">✨ Premium Feature</span>
        </div>
        <button 
          onClick={() => router.push('/pricing')}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-all transform hover:scale-105"
        >
          <span>Upgrade to Unlock</span>
          <span>🎯</span>
        </button>
      </div>
    </div>
  );
}

// Free Plan Upgrade Banner
function FreePlanUpgradeBanner() {
  const router = useRouter();
  
  return (
    <div className="mb-8 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-200 rounded-2xl p-6 shadow-md">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl shadow-lg">
            🚀
          </div>
          <div>
            <h3 className="text-xl font-bold text-amber-800">✨ Unlock Your Full Potential ✨</h3>
            <p className="text-amber-700">Get access to ALL letter templates, advanced features, and personalized guidance</p>
            <div className="flex gap-3 mt-2">
              <span className="text-xs bg-white/60 px-2 py-1 rounded-full text-amber-700">✓ 200+ Premium Templates</span>
              <span className="text-xs bg-white/60 px-2 py-1 rounded-full text-amber-700">✓ Expert Tips & Guides</span>
              <span className="text-xs bg-white/60 px-2 py-1 rounded-full text-amber-700">✓ Priority Support</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push('/pricing')}
          className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
        >
          🎯 Upgrade Now & Save 20% →
        </button>
      </div>
    </div>
  );
}

// Letter Card Component (Unlocked for Premium/Pro)
function LetterCard({ letter, onReadMore }) {
  const category = getLetterCategory(letter.letter_type);
  const level = getLetterLevel(letter.level);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`group block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${category.borderClass} border-l-8`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onReadMore(letter)}
    >
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

      <h4 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">{letter.title}</h4>
      {letter.content && (
        <p className="text-sm text-gray-600 mb-5 line-clamp-3 leading-relaxed">{letter.content.substring(0, 150)}...</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(letter.createdAt)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReadMore(letter);
          }}
          className="font-semibold text-sky-600 hover:text-sky-800 transition flex items-center gap-1"
        >
          Read Full Letter
          <svg className={`w-4 h-4 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Main Letters View Content
function LettersViewContent() {
  const [isClient, setIsClient] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicId = searchParams.get('topic') || searchParams.get('topicId');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: userData, isLoading: userLoading, error: userError } = useCurrentUser();
  const { data: contentTreeData, isLoading: contentTreeLoading } = useContentTree();
  const { data: lettersByTopic, isLoading: lettersByTopicLoading } = useLettersByTopic(topicId || '');

  const userPlan = userData?.planName?.toLowerCase() || 'free';
  const isPremiumOrExpert = userPlan === 'premium' || userPlan === 'expert' || userPlan === 'pro';

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (userError) router.push(Routes.auth.login);
  }, [userError, router]);

  useEffect(() => {
    if (!topicId && isClient) {
      router.push('/dashboard-letters');
    }
  }, [topicId, isClient, router]);

  const categories = Array.isArray(contentTreeData) ? contentTreeData : [];
  const subcategories = categories.flatMap((category) => category.subcategories || []);
  const topics = subcategories.flatMap((subcategory) => subcategory.topics || []);
  const currentTopic = topics.find((t) => String(t._id) === String(topicId));
  const letters = (currentTopic?.letters && currentTopic.letters.length > 0)
    ? currentTopic.letters
    : (Array.isArray(lettersByTopic) ? lettersByTopic : []);
  
  // Find parent category and subcategory for breadcrumb
  let currentCategory = null;
  let currentSubcategory = null;
  
  for (const category of categories) {
    for (const subcategory of category.subcategories || []) {
      if (subcategory.topics?.some((t) => String(t._id) === String(topicId))) {
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

  const handleReadMore = (letter) => {
    if (!isPremiumOrExpert) {
      setShowUpgradeModal(true);
      return;
    }
    setSelectedLetter(letter);
  };

  const closeModal = () => {
    setSelectedLetter(null);
    setShowUpgradeModal(false);
  };

  if (!isClient || userLoading || (topicId && lettersByTopicLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading your letters...</p>
          <p className="text-sm text-gray-400">This will only take a moment</p>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50">
      <Navbar user={userData} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
          <Link href="/dashboard" className="text-gray-500 hover:text-sky-600 transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>
          <span className="text-gray-400">/</span>
          <Link href="/dashboard-letters" className="text-gray-500 hover:text-sky-600 transition-colors">Categories</Link>
          {currentCategory && (
            <>
              <span className="text-gray-400">/</span>
              <span className="text-gray-700 hover:text-sky-600 transition-colors font-medium">{currentCategory.name}</span>
            </>
          )}
          {currentSubcategory && (
            <>
              <span className="text-gray-400">/</span>
              <span className="text-gray-700 hover:text-sky-600 transition-colors font-medium">{currentSubcategory.name}</span>
            </>
          )}
          {currentTopic && (
            <>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-semibold">{currentTopicDisplayName}</span>
            </>
          )}
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-white/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Back to Categories
            </button>
            
            {!isPremiumOrExpert && (
              <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <span>💡</span>
                Free Plan • {filteredLetters.length} letters locked
              </div>
            )}
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-3xl shadow-md">
              📚
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentTopicDisplayName}</h1>
              <p className="text-gray-600 mb-2">
                {isPremiumOrExpert 
                  ? `✨ You have access to ${filteredLetters.length} letter templates in this category`
                  : `🔒 ${filteredLetters.length} premium letter templates available - Upgrade to unlock`}
              </p>
              {!isPremiumOrExpert && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-amber-600">🎯 Pro tip:</span>
                  <span className="text-gray-600">Premium members get personalized guidance and expert tips with every letter</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Free Plan Upgrade Banner */}
        {!isPremiumOrExpert && <FreePlanUpgradeBanner />}

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="🔍 Search letters by title, content, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-5 py-4 text-base border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-200 bg-white shadow-sm"
          />
          {searchQuery && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Found <span className="font-semibold text-gray-700">{filteredLetters.length}</span> letters
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
          {!isPremiumOrExpert && filteredLetters.length > 0 && (
            <p className="text-xs text-amber-600">👑 Upgrade to see previews and full content</p>
          )}
        </div>

        {/* Letters Grid */}
        {contentTreeLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600">Loading letter templates...</p>
            </div>
          </div>
        ) : filteredLetters.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-2xl">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No letters match your search' : 'No letters available yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `Try different keywords or browse other categories` 
                : `Check back soon for new letter templates in this category`}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="mt-4 text-sky-600 hover:text-sky-700">
                Clear search →
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLetters.map((letter, index) => (
              isPremiumOrExpert ? (
                <LetterCard key={letter._id} letter={letter} onReadMore={handleReadMore} />
              ) : (
                <LockedLetterCard key={`locked-${index}`} letterInfo={letter} />
              )
            ))}
          </div>
        )}
        
        {/* Upgrade CTA for Free Users */}
        {!isPremiumOrExpert && filteredLetters.length > 0 && (
          <div className="mt-12 text-center bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-8 border-2 border-amber-300">
            <div className="max-w-2xl mx-auto">
              <div className="text-5xl mb-4">🌟</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Transform Your Communication?</h3>
              <p className="text-gray-700 mb-6">
                Get instant access to all {filteredLetters.length}+ letter templates plus expert guidance, 
                personalized feedback, and premium resources.
              </p>
              <div className="flex flex-wrap gap-4 justify-center mb-6">
                <div className="flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full">
                  <span>✓</span> 200+ Templates
                </div>
                <div className="flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full">
                  <span>✓</span> Expert Tips
                </div>
                <div className="flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full">
                  <span>✓</span> Personalized Help
                </div>
                <div className="flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full">
                  <span>✓</span> Priority Support
                </div>
              </div>
              <button
                onClick={() => router.push('/pricing')}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                🚀 Unlock All Letters & Features - Starting at $9.99/month →
              </button>
              <p className="text-xs text-gray-600 mt-4">30-day money-back guarantee • Cancel anytime</p>
            </div>
          </div>
        )}

        {/* Letter Detail Modal */}
        {selectedLetter && isPremiumOrExpert && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-5 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedLetter.title}</h2>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full">
                      {getLetterCategory(selectedLetter.letter_type).title}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {getLetterLevel(selectedLetter.level).label}
                    </span>
                  </div>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-8 overflow-y-auto max-h-[calc(85vh-120px)]">
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {selectedLetter.content}
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedLetter.content);
                      alert('Letter copied to clipboard! 📋');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Modal for Free Users */}
        {showUpgradeModal && !isPremiumOrExpert && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Content Locked</h3>
              <p className="text-gray-600 mb-6">
                This letter template is only available for Premium and Pro members.
                Upgrade now to unlock all {filteredLetters.length} letters and premium features!
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    closeModal();
                    router.push('/pricing');
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  🚀 Upgrade to Premium
                </button>
                <button
                  onClick={closeModal}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// Main Export
export default function LettersViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-lg">Loading Words to Wellness...</p>
          <p className="text-sm text-gray-400">Preparing your letter library</p>
        </div>
      </div>
    }>
      <LettersViewContent />
    </Suspense>
  );
}