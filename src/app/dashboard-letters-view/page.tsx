'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import { useContentTree, useLettersByTopic } from '@/hooks/use-content';
import Link from 'next/link';
import { normalizeEntityId } from '@/lib/api-utils';
import PlanStatusBadge from '@/components/plan-status-badge';
import {
  LETTERS_VIEW_LAYOUT,
  LETTERS_VIEW_LOADING,
  LETTERS_VIEW_NAVBAR,
  LETTERS_VIEW_BREADCRUMB,
  LETTERS_VIEW_HEADER,
  LETTERS_VIEW_SEARCH,
  LETTERS_VIEW_GRID,
  LETTERS_VIEW_UPGRADE,
  LETTERS_VIEW_LETTER_CARD,
  LETTERS_VIEW_LOCKED_CARD,
} from '@/styles/letters-view-styles';

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
    <nav className={LETTERS_VIEW_NAVBAR.container}>
      <Link href="/dashboard" className={LETTERS_VIEW_NAVBAR.logoLink}>
        <svg className={LETTERS_VIEW_NAVBAR.logoSvg} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span className={LETTERS_VIEW_NAVBAR.logoSpan}>Wordstowellness</span>
      </Link>

      <div className={LETTERS_VIEW_NAVBAR.navLinks}>
        <Link href="/dashboard" className={LETTERS_VIEW_NAVBAR.navLink}>Dashboard</Link>
        <Link href="/dashboard-letters" className={LETTERS_VIEW_NAVBAR.navLinkActive}>Browse letters</Link>
        <Link href="/search-feelings" className={LETTERS_VIEW_NAVBAR.navLink}>Search by feelings</Link>
        <Link href="/improve-message" className={LETTERS_VIEW_NAVBAR.navLink}>Improve my message</Link>
        <Link href="/pricing" className={LETTERS_VIEW_NAVBAR.navLink}>Pricing</Link>
      </div>

      <div className={LETTERS_VIEW_NAVBAR.userActions}>
        <PlanStatusBadge user={user} />
        <button onClick={handleLogout} className={LETTERS_VIEW_NAVBAR.logoutButton}>
          <svg className={LETTERS_VIEW_NAVBAR.logoutIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className={LETTERS_VIEW_LOCKED_CARD.container}>
      <div className={LETTERS_VIEW_LOCKED_CARD.headerContainer}>
        <div className={LETTERS_VIEW_LOCKED_CARD.iconContainer}>🔒</div>
        <span className={LETTERS_VIEW_LOCKED_CARD.badge}>Locked</span>
      </div>
      <div className={LETTERS_VIEW_LOCKED_CARD.titleSkeleton}></div>
      <div className={LETTERS_VIEW_LOCKED_CARD.contentSkeleton}>
        <div className={LETTERS_VIEW_LOCKED_CARD.contentSkeletonLine1}></div>
        <div className={LETTERS_VIEW_LOCKED_CARD.contentSkeletonLine2}></div>
        <div className={LETTERS_VIEW_LOCKED_CARD.contentSkeletonLine3}></div>
      </div>
      <div className={LETTERS_VIEW_LOCKED_CARD.footer}>
        <span className={LETTERS_VIEW_LOCKED_CARD.premiumLabel}>Premium content</span>
        <button
          onClick={() => router.push('/pricing')}
          className={LETTERS_VIEW_LOCKED_CARD.upgradeButton}
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
    <div className={LETTERS_VIEW_LETTER_CARD.container(category.borderClass)}>
      <div className={LETTERS_VIEW_LETTER_CARD.headerContainer}>
        <div className="min-w-0">
          <p className={LETTERS_VIEW_LETTER_CARD.categoryTitle}>{category.title}</p>
        </div>
        <span className={LETTERS_VIEW_LETTER_CARD.levelBadge(level.badgeClass)}>
          {level.label}
        </span>
      </div>

      <h4 className={LETTERS_VIEW_LETTER_CARD.title}>{letter.title}</h4>
      {letter.content && (
        <p className={LETTERS_VIEW_LETTER_CARD.content}>{letter.content}</p>
      )}
      <div className={LETTERS_VIEW_LETTER_CARD.footer}>
        <span>{formatDate(letter.createdAt)}</span>
        <button className={LETTERS_VIEW_LETTER_CARD.readMoreButton}>
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
    
    if (typeA !== typeB) {
      return typeA.localeCompare(typeB);
    }
    
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
      <div className={LETTERS_VIEW_LAYOUT.loadingContainer}>
        <div className={LETTERS_VIEW_LOADING.content}>
          <div className={LETTERS_VIEW_LOADING.spinner}></div>
          <p className={LETTERS_VIEW_LOADING.text}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className={LETTERS_VIEW_LAYOUT.container}>
      <Navbar user={userData} />

      <main className={LETTERS_VIEW_LAYOUT.main}>
        {/* Breadcrumb */}
        <div className={LETTERS_VIEW_BREADCRUMB.container}>
          <Link href="/dashboard" className={LETTERS_VIEW_BREADCRUMB.link}>Dashboard</Link>
          <span>/</span>
          <Link href="/dashboard-letters" className={LETTERS_VIEW_BREADCRUMB.link}>Letters</Link>
          {currentCategory && (
            <>
              <span>/</span>
              <Link href={`/dashboard-subcategories?cat=${normalizeEntityId(currentCategory)}`} className={LETTERS_VIEW_BREADCRUMB.categoryLink}>{currentCategory.name}</Link>
            </>
          )}
          {currentSubcategory && (
            <>
              <span>/</span>
              <Link href={`/dashboard-topics?sub=${normalizeEntityId(currentSubcategory)}`} className={LETTERS_VIEW_BREADCRUMB.subcategoryLink}>{currentSubcategory.name}</Link>
            </>
          )}
          {currentTopic && (
            <>
              <span>/</span>
              <span className={LETTERS_VIEW_BREADCRUMB.current}>{currentTopicDisplayName}</span>
            </>
          )}
        </div>

        {/* Header */}
        <div className={LETTERS_VIEW_HEADER.container}>
          <div className={LETTERS_VIEW_HEADER.backButton}>
            <Link href={currentCategory ? `/dashboard-subcategories?cat=${normalizeEntityId(currentCategory)}` : '/dashboard-letters'} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
              <svg className={LETTERS_VIEW_HEADER.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Back
            </Link>
          </div>
          <div className={LETTERS_VIEW_HEADER.contentContainer}>
            <div className={LETTERS_VIEW_HEADER.iconContainer}>📄</div>
            <div>
              <h1 className={LETTERS_VIEW_HEADER.title}>{currentTopicDisplayName}</h1>
              <p className={LETTERS_VIEW_HEADER.subtitle}>{letters.length} letters available</p>
              {!hasPaidAccess && (
                <p className={LETTERS_VIEW_HEADER.upgradeNotice}>
                  <span>🔒</span> Upgrade to Premium or Expert to unlock all letters
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className={LETTERS_VIEW_SEARCH.container}>
          <div className={LETTERS_VIEW_SEARCH.searchIcon}>
            <svg className={LETTERS_VIEW_SEARCH.searchIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search letters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={LETTERS_VIEW_SEARCH.input}
          />
        </div>

        {/* Letters Grid */}
        {contentTreeLoading ? (
          <div className={LETTERS_VIEW_GRID.loadingContainer}>
            <div className={LETTERS_VIEW_LOADING.content}>
              <div className={LETTERS_VIEW_LOADING.spinner}></div>
              <p className={LETTERS_VIEW_LOADING.text}>Loading letters...</p>
            </div>
          </div>
        ) : filteredLetters.length === 0 ? (
          <div className={LETTERS_VIEW_GRID.emptyContainer}>
            <div className={LETTERS_VIEW_GRID.emptyIcon}>📄</div>
            <h3 className={LETTERS_VIEW_GRID.emptyTitle}>{searchQuery ? 'No letters found' : 'No letters available'}</h3>
            <p className={LETTERS_VIEW_GRID.emptyDescription}>{searchQuery ? 'Try a different search term' : 'Letters will appear here once they\'re added.'}</p>
          </div>
        ) : hasPaidAccess ? (
          <div className={LETTERS_VIEW_GRID.container}>
            {filteredLetters.map((letter) => (
              <LetterCard key={letter._id} letter={letter} />
            ))}
          </div>
        ) : (
          <>
            <div className={LETTERS_VIEW_GRID.container}>
              {Array.from({ length: Math.max(filteredLetters.length, 3) }).map((_, index) => (
                <LockedLetterCard key={`locked-${index}`} />
              ))}
            </div>
            <div className={LETTERS_VIEW_UPGRADE.container}>
              <button
                onClick={() => router.push('/pricing')}
                className={LETTERS_VIEW_UPGRADE.button}
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
      <div className={LETTERS_VIEW_LAYOUT.loadingContainer}>
        <div className={LETTERS_VIEW_LOADING.content}>
          <div className={LETTERS_VIEW_LOADING.spinner}></div>
          <p className={LETTERS_VIEW_LOADING.text}>Loading...</p>
        </div>
      </div>
    }>
      <LettersViewContent />
    </Suspense>
  );
}