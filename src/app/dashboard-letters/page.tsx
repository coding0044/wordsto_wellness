'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import { useContentTree } from '@/hooks/use-content';
import Link from 'next/link';
import { normalizeEntityId } from '@/lib/api-utils';
import PlanStatusBadge from '@/components/plan-status-badge';
import { formatDate } from '@helpers/date';
import {
  BROWSE_LETTERS_LAYOUT,
  BROWSE_LETTERS_LOADING,
  BROWSE_LETTERS_NAVBAR,
  BROWSE_LETTERS_HEADER,
  BROWSE_LETTERS_SEARCH,
  BROWSE_LETTERS_GRID,
  BROWSE_LETTERS_CATEGORY_CARD,
} from '@/styles/browse-letters-styles';

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
    <nav className={BROWSE_LETTERS_NAVBAR.container}>
      <Link href="/dashboard" className={BROWSE_LETTERS_NAVBAR.logoLink}>
        <svg className={BROWSE_LETTERS_NAVBAR.logoSvg} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span className={BROWSE_LETTERS_NAVBAR.logoSpan}>Wordstowellness</span>
      </Link>

      <div className={BROWSE_LETTERS_NAVBAR.navLinks}>
        <Link href="/dashboard" className={BROWSE_LETTERS_NAVBAR.navLink}>
          Dashboard
        </Link>
        <Link href="/dashboard-letters" className={BROWSE_LETTERS_NAVBAR.navLinkActive}>
          Browse letters
        </Link>
        <Link href="/search-feelings" className={BROWSE_LETTERS_NAVBAR.navLink}>
          Search by feelings
        </Link>
        <Link href="/improve-message" className={BROWSE_LETTERS_NAVBAR.navLink}>
          Improve my message
        </Link>
        <Link href="/pricing" className={BROWSE_LETTERS_NAVBAR.navLink}>
          Pricing
        </Link>
      </div>

      <div className={BROWSE_LETTERS_NAVBAR.userActions}>
        <PlanStatusBadge user={user} />
        <button
          onClick={handleLogout}
          className={BROWSE_LETTERS_NAVBAR.logoutButton}
        >
          <svg className={BROWSE_LETTERS_NAVBAR.logoutIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Log out
        </button>
      </div>
    </nav>
  );
}

// Category Card Component
function CategoryCard({ category }) {
  return (
    <Link
      href={`/dashboard-subcategories?cat=${normalizeEntityId(category)}`}
      className={BROWSE_LETTERS_CATEGORY_CARD.link}
    >
      <div className={BROWSE_LETTERS_CATEGORY_CARD.headerContainer}>
        <div className={BROWSE_LETTERS_CATEGORY_CARD.iconContainer}>
          📚
        </div>
        <span className={BROWSE_LETTERS_CATEGORY_CARD.badge}>
          Category
        </span>
      </div>
      <h3 className={BROWSE_LETTERS_CATEGORY_CARD.title}>
        {category.name}
      </h3>
      <p className={`${BROWSE_LETTERS_CATEGORY_CARD.description} ${(!category.description || category.description === 'NULL') ? BROWSE_LETTERS_CATEGORY_CARD.descriptionEmpty : ''}`}>
        {!category.description || category.description === 'NULL' ? 'No description' : category.description}
      </p>
      <div className={BROWSE_LETTERS_CATEGORY_CARD.footer}>
        <span className={BROWSE_LETTERS_CATEGORY_CARD.date}>{formatDate(category.createdAt)}</span>
        <div className={BROWSE_LETTERS_CATEGORY_CARD.exploreLink}>
          <span>Explore</span>
          <span>→</span>
        </div>
      </div>
    </Link>
  );
}

// Main Browse Letters Content
function BrowseLettersContent() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
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

  const sortedCategories = [...categories].sort((a, b) =>
    (a?.name || '').localeCompare(b?.name || '', undefined, { sensitivity: 'base' })
  );

  const filteredCategories = sortedCategories.filter((cat) => {
    const name = cat.name || '';
    const desc = cat.description || '';
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (!isClient || userLoading) {
    return (
      <div className={BROWSE_LETTERS_LAYOUT.loadingContainer}>
        <div className={BROWSE_LETTERS_LOADING.content}>
          <div className={BROWSE_LETTERS_LOADING.spinner}></div>
          <p className={BROWSE_LETTERS_LOADING.text}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const user = userData;

  return (
    <div className={BROWSE_LETTERS_LAYOUT.container}>
      <Navbar user={user} />

      <main className={BROWSE_LETTERS_LAYOUT.main}>
        {/* Header */}
        <div className={BROWSE_LETTERS_HEADER.container}>
          <div className={BROWSE_LETTERS_HEADER.backButton}>
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className={BROWSE_LETTERS_HEADER.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Back to Dashboard
            </Link>
          </div>
          <div className={BROWSE_LETTERS_HEADER.contentContainer}>
            <div className={BROWSE_LETTERS_HEADER.iconContainer}>
              📚
            </div>
            <div>
              <h1 className={BROWSE_LETTERS_HEADER.title}>All Categories</h1>
              <p className={BROWSE_LETTERS_HEADER.subtitle}>{categories.length} categories available</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className={BROWSE_LETTERS_SEARCH.container}>
          <div className={BROWSE_LETTERS_SEARCH.searchIcon}>
            <svg className={BROWSE_LETTERS_SEARCH.searchIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={BROWSE_LETTERS_SEARCH.input}
          />
        </div>

        {/* Categories Grid */}
        {contentTreeLoading ? (
          <div className={BROWSE_LETTERS_GRID.loadingContainer}>
            <div className={BROWSE_LETTERS_LOADING.content}>
              <div className={BROWSE_LETTERS_LOADING.spinner}></div>
              <p className={BROWSE_LETTERS_LOADING.text}>Loading categories...</p>
            </div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className={BROWSE_LETTERS_GRID.emptyContainer}>
            <div className={BROWSE_LETTERS_GRID.emptyIcon}>
              📚
            </div>
            <h3 className={BROWSE_LETTERS_GRID.emptyTitle}>
              {searchQuery ? 'No categories found' : 'No categories yet'}
            </h3>
            <p className={BROWSE_LETTERS_GRID.emptyDescription}>
              {searchQuery ? 'Try a different search term.' : 'No categories are available yet. Once categories exist in the database, they will appear here.'}
            </p>
          </div>
        ) : (
          <div className={BROWSE_LETTERS_GRID.container}>
            {filteredCategories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Main export with Suspense wrapper
export default function BrowseLetters() {
  return (
    <Suspense fallback={
      <div className={BROWSE_LETTERS_LAYOUT.loadingContainer}>
        <div className={BROWSE_LETTERS_LOADING.content}>
          <div className={BROWSE_LETTERS_LOADING.spinner}></div>
          <p className={BROWSE_LETTERS_LOADING.text}>Loading...</p>
        </div>
      </div>
    }>
      <BrowseLettersContent />
    </Suspense>
  );
}