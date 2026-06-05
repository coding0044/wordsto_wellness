'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import { useContentTree } from '@/hooks/use-content';
import Link from 'next/link';
import { normalizeEntityId } from '@/lib/api-utils';
import PlanStatusBadge from '@/components/plan-status-badge';
import {
  SUBCATEGORIES_LAYOUT,
  SUBCATEGORIES_LOADING,
  SUBCATEGORIES_NAVBAR,
  SUBCATEGORIES_BREADCRUMB,
  SUBCATEGORIES_HEADER,
  SUBCATEGORIES_SEARCH,
  SUBCATEGORIES_GRID,
  SUBCATEGORIES_CARD,
} from '@/styles/subcategories-styles';

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
    <nav className={SUBCATEGORIES_NAVBAR.container}>
      <Link href="/dashboard" className={SUBCATEGORIES_NAVBAR.logoLink}>
        <svg className={SUBCATEGORIES_NAVBAR.logoSvg} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span className={SUBCATEGORIES_NAVBAR.logoSpan}>Wordstowellness</span>
      </Link>

      <div className={SUBCATEGORIES_NAVBAR.navLinks}>
        <Link href="/dashboard" className={SUBCATEGORIES_NAVBAR.navLink}>Dashboard</Link>
        <Link href="/dashboard-letters" className={SUBCATEGORIES_NAVBAR.navLinkActive}>Browse letters</Link>
        <Link href="/search-feelings" className={SUBCATEGORIES_NAVBAR.navLink}>Search by feelings</Link>
        <Link href="/improve-message" className={SUBCATEGORIES_NAVBAR.navLink}>Improve my message</Link>
        <Link href="/pricing" className={SUBCATEGORIES_NAVBAR.navLink}>Pricing</Link>
      </div>

      <div className={SUBCATEGORIES_NAVBAR.userActions}>
        <PlanStatusBadge user={user} />
        <button onClick={handleLogout} className={SUBCATEGORIES_NAVBAR.logoutButton}>
          <svg className={SUBCATEGORIES_NAVBAR.logoutIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Log out
        </button>
      </div>
    </nav>
  );
}

// Subcategory Card Component
function SubcategoryCard({ subcategory }) {
  return (
    <Link href={`/dashboard-topics?sub=${normalizeEntityId(subcategory)}`} className={SUBCATEGORIES_CARD.link}>
      <div className={SUBCATEGORIES_CARD.headerContainer}>
        <div className={SUBCATEGORIES_CARD.iconContainer}>📁</div>
        <span className={SUBCATEGORIES_CARD.badge}>Subcategory</span>
      </div>
      <h3 className={SUBCATEGORIES_CARD.title}>{subcategory.name}</h3>
      <p className={`${SUBCATEGORIES_CARD.description} ${subcategory.description ? '' : SUBCATEGORIES_CARD.descriptionEmpty}`}>
        {subcategory.description || 'No description'}
      </p>
      <div className={SUBCATEGORIES_CARD.footer}>
        <span className={SUBCATEGORIES_CARD.date}>{formatDate(subcategory.createdAt)}</span>
        <div className={SUBCATEGORIES_CARD.exploreLink}>
          <span>Explore</span>
          <span>→</span>
        </div>
      </div>
    </Link>
  );
}

// Main Subcategories Content
function SubcategoriesContent() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('cat');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: userData, isLoading: userLoading, error: userError } = useCurrentUser();
  const { data: contentTreeData, isLoading: contentTreeLoading, error: contentTreeError } = useContentTree();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (userError) router.push('/login');
  }, [userError, router]);

  const categories = Array.isArray(contentTreeData) ? contentTreeData : [];
  const normalizedCategoryId = normalizeEntityId(categoryId);
  const currentCategory = categories.find(c => normalizeEntityId(c) === normalizedCategoryId);
  const subcategories = currentCategory?.subcategories || [];

  const sortedSubcategories = [...subcategories].sort((a, b) =>
    (a?.name || '').localeCompare(b?.name || '', undefined, { sensitivity: 'base' })
  );

  const filteredSubcategories = sortedSubcategories.filter(sub =>
    sub.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isClient || userLoading || contentTreeLoading) {
    return (
      <div className={SUBCATEGORIES_LAYOUT.loadingContainer}>
        <div className={SUBCATEGORIES_LOADING.content}>
          <div className={SUBCATEGORIES_LOADING.spinner}></div>
          <p className={SUBCATEGORIES_LOADING.text}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  if (!categoryId || (!currentCategory && !contentTreeLoading)) {
    return (
      <div className={SUBCATEGORIES_LAYOUT.errorContainer}>
        <div className={SUBCATEGORIES_LAYOUT.errorCard}>
          <h1 className={SUBCATEGORIES_LAYOUT.errorTitle}>Category not found</h1>
          <p className={SUBCATEGORIES_LAYOUT.errorMessage}>The selected category is not available. Please go back to the category list and try again.</p>
          <Link href="/dashboard-letters" className={SUBCATEGORIES_LAYOUT.errorButton}>
            Back to categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={SUBCATEGORIES_LAYOUT.container}>
      <Navbar user={userData} />

      <main className={SUBCATEGORIES_LAYOUT.main}>
        {/* Breadcrumb */}
        <div className={SUBCATEGORIES_BREADCRUMB.container}>
          <Link href="/dashboard" className={SUBCATEGORIES_BREADCRUMB.link}>Dashboard</Link>
          <span>/</span>
          <Link href="/dashboard-letters" className={SUBCATEGORIES_BREADCRUMB.link}>Categories</Link>
          <span>/</span>
          <span className={SUBCATEGORIES_BREADCRUMB.current}>{currentCategory?.name || 'Subcategories'}</span>
        </div>

        {/* Header */}
        <div className={SUBCATEGORIES_HEADER.container}>
          <div className={SUBCATEGORIES_HEADER.backButton}>
            <button onClick={() => router.back()} className={SUBCATEGORIES_HEADER.backButtonInner}>
              <svg className={SUBCATEGORIES_HEADER.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          </div>
          <div className={SUBCATEGORIES_HEADER.contentContainer}>
            <div className={SUBCATEGORIES_HEADER.iconContainer}>📁</div>
            <div>
              <h1 className={SUBCATEGORIES_HEADER.title}>{currentCategory?.name || 'Subcategories'}</h1>
              <p className={SUBCATEGORIES_HEADER.subtitle}>{subcategories.length} subcategories found</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className={SUBCATEGORIES_SEARCH.container}>
          <div className={SUBCATEGORIES_SEARCH.searchIcon}>
            <svg className={SUBCATEGORIES_SEARCH.searchIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search subcategories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={SUBCATEGORIES_SEARCH.input}
          />
        </div>

        {/* Subcategories Grid */}
        {contentTreeLoading ? (
          <div className={SUBCATEGORIES_GRID.loadingContainer}>
            <div className={SUBCATEGORIES_LOADING.content}>
              <div className={SUBCATEGORIES_LOADING.spinner}></div>
              <p className={SUBCATEGORIES_LOADING.text}>Loading subcategories...</p>
            </div>
          </div>
        ) : filteredSubcategories.length === 0 ? (
          <div className={SUBCATEGORIES_GRID.emptyContainer}>
            <div className={SUBCATEGORIES_GRID.emptyIcon}>📁</div>
            <h3 className={SUBCATEGORIES_GRID.emptyTitle}>{searchQuery ? 'No subcategories found' : 'No subcategories available'}</h3>
            <p className={SUBCATEGORIES_GRID.emptyDescription}>{searchQuery ? 'Try a different search term' : 'Subcategories will appear here once they\'re added.'}</p>
          </div>
        ) : (
          <div className={SUBCATEGORIES_GRID.container}>
            {filteredSubcategories.map((subcategory) => (
              <SubcategoryCard key={subcategory._id} subcategory={subcategory} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SubcategoriesPage() {
  return (
    <Suspense fallback={
      <div className={SUBCATEGORIES_LAYOUT.loadingContainer}>
        <div className={SUBCATEGORIES_LOADING.content}>
          <div className={SUBCATEGORIES_LOADING.spinner}></div>
          <p className={SUBCATEGORIES_LOADING.text}>Loading...</p>
        </div>
      </div>
    }>
      <SubcategoriesContent />
    </Suspense>
  );
}