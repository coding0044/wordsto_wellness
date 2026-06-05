'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import { useContentTree } from '@/hooks/use-content';
import Link from 'next/link';
import { normalizeEntityId } from '@/lib/api-utils';
import PlanStatusBadge from '@/components/plan-status-badge';
import {
  TOPICS_LAYOUT,
  TOPICS_LOADING,
  TOPICS_NAVBAR,
  TOPICS_BREADCRUMB,
  TOPICS_HEADER,
  TOPICS_SEARCH,
  TOPICS_GRID,
  TOPICS_CARD,
} from '@/styles/topics-styles';

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
    <nav className={TOPICS_NAVBAR.container}>
      <Link href="/dashboard" className={TOPICS_NAVBAR.logoLink}>
        <svg className={TOPICS_NAVBAR.logoSvg} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span className={TOPICS_NAVBAR.logoSpan}>Wordstowellness</span>
      </Link>

      <div className={TOPICS_NAVBAR.navLinks}>
        <Link href="/dashboard" className={TOPICS_NAVBAR.navLink}>Dashboard</Link>
        <Link href="/dashboard-letters" className={TOPICS_NAVBAR.navLinkActive}>Browse letters</Link>
        <Link href="/search-feelings" className={TOPICS_NAVBAR.navLink}>Search by feelings</Link>
        <Link href="/improve-message" className={TOPICS_NAVBAR.navLink}>Improve my message</Link>
        <Link href="/pricing" className={TOPICS_NAVBAR.navLink}>Pricing</Link>
      </div>

      <div className={TOPICS_NAVBAR.userActions}>
        <PlanStatusBadge user={user} />
        <button onClick={handleLogout} className={TOPICS_NAVBAR.logoutButton}>
          <svg className={TOPICS_NAVBAR.logoutIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Log out
        </button>
      </div>
    </nav>
  );
}

// Topic Card Component
function TopicCard({ topic }) {
  return (
    <Link href={`/dashboard-letters-view?topic=${normalizeEntityId(topic)}`} className={TOPICS_CARD.link}>
      <div className={TOPICS_CARD.headerContainer}>
        <div className={TOPICS_CARD.iconContainer}>📋</div>
        <span className={TOPICS_CARD.badge}>Topic</span>
      </div>
      <h3 className={TOPICS_CARD.title}>{topic.name}</h3>
      <p className={`${TOPICS_CARD.description} ${topic.description ? '' : TOPICS_CARD.descriptionEmpty}`}>
        {topic.description || 'No description'}
      </p>
      <div className={TOPICS_CARD.footer}>
        <span className={TOPICS_CARD.date}>{formatDate(topic.createdAt)}</span>
        <div className={TOPICS_CARD.exploreLink}>
          <span>View</span>
          <span>→</span>
        </div>
      </div>
    </Link>
  );
}

// Main Topics Content
function TopicsContent() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const subcategoryId = searchParams.get('sub');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: userData, isLoading: userLoading, error: userError } = useCurrentUser();
  const { data: contentTreeData, isLoading: contentTreeLoading } = useContentTree();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (userError) router.push('/login');
  }, [userError, router]);

  const categories = Array.isArray(contentTreeData) ? contentTreeData : [];
  const subcategories = categories.flatMap((category) => category.subcategories || []);
  const normalizedSubcategoryId = normalizeEntityId(subcategoryId);
  const currentSubcategory = subcategories.find((s) => normalizeEntityId(s) === normalizedSubcategoryId);
  const topics = currentSubcategory?.topics || [];
  const categoryId = currentSubcategory?.category;

  const sortedTopics = [...topics].sort((a, b) =>
    (a?.name || '').localeCompare(b?.name || '', undefined, { sensitivity: 'base' })
  );

  const filteredTopics = sortedTopics.filter(topic =>
    topic.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isClient || userLoading || contentTreeLoading) {
    return (
      <div className={TOPICS_LAYOUT.loadingContainer}>
        <div className={TOPICS_LOADING.content}>
          <div className={TOPICS_LOADING.spinner}></div>
          <p className={TOPICS_LOADING.text}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className={TOPICS_LAYOUT.container}>
      <Navbar user={userData} />

      <main className={TOPICS_LAYOUT.main}>
        {/* Breadcrumb */}
        <div className={TOPICS_BREADCRUMB.container}>
          <Link href="/dashboard" className={TOPICS_BREADCRUMB.link}>Dashboard</Link>
          <span>/</span>
          <Link href="/dashboard-letters" className={TOPICS_BREADCRUMB.link}>Categories</Link>
          <span>/</span>
          <Link href={`/dashboard-subcategories?cat=${categoryId}`} className={TOPICS_BREADCRUMB.link}>Subcategories</Link>
          <span>/</span>
          <span className={TOPICS_BREADCRUMB.current}>{currentSubcategory?.name || 'Topics'}</span>
        </div>

        {/* Header */}
        <div className={TOPICS_HEADER.container}>
          <div className={TOPICS_HEADER.backButton}>
            <button onClick={() => router.back()} className={TOPICS_HEADER.backButtonInner}>
              <svg className={TOPICS_HEADER.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          </div>
          <div className={TOPICS_HEADER.contentContainer}>
            <div className={TOPICS_HEADER.iconContainer}>📋</div>
            <div>
              <h1 className={TOPICS_HEADER.title}>{currentSubcategory?.name || 'Topics'}</h1>
              <p className={TOPICS_HEADER.subtitle}>{topics.length} topics available</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className={TOPICS_SEARCH.container}>
          <div className={TOPICS_SEARCH.searchIcon}>
            <svg className={TOPICS_SEARCH.searchIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={TOPICS_SEARCH.input}
          />
        </div>

        {/* Topics Grid */}
        {contentTreeLoading ? (
          <div className={TOPICS_GRID.loadingContainer}>
            <div className={TOPICS_LOADING.content}>
              <div className={TOPICS_LOADING.spinner}></div>
              <p className={TOPICS_LOADING.text}>Loading topics...</p>
            </div>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className={TOPICS_GRID.emptyContainer}>
            <div className={TOPICS_GRID.emptyIcon}>📋</div>
            <h3 className={TOPICS_GRID.emptyTitle}>{searchQuery ? 'No topics found' : 'No topics available'}</h3>
            <p className={TOPICS_GRID.emptyDescription}>{searchQuery ? 'Try a different search term' : 'Topics will appear here once they\'re added.'}</p>
          </div>
        ) : (
          <div className={TOPICS_GRID.container}>
            {filteredTopics.map((topic) => (
              <TopicCard key={topic._id} topic={topic} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function TopicsPage() {
  return (
    <Suspense fallback={
      <div className={TOPICS_LAYOUT.loadingContainer}>
        <div className={TOPICS_LOADING.content}>
          <div className={TOPICS_LOADING.spinner}></div>
          <p className={TOPICS_LOADING.text}>Loading...</p>
        </div>
      </div>
    }>
      <TopicsContent />
    </Suspense>
  );
}