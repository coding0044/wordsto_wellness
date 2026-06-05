'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import { useContentTree } from '@/hooks/use-content';
import Link from 'next/link';
import PlanStatusBadge from '@/components/plan-status-badge';
import {
  SEARCH_FEELINGS_LAYOUT,
  SEARCH_FEELINGS_LOADING,
  SEARCH_FEELINGS_NAVBAR,
  SEARCH_FEELINGS_HEADER,
  SEARCH_FEELINGS_EMPTY,
  SEARCH_FEELINGS_NO_RESULTS,
  SEARCH_FEELINGS_RESULTS_GRID,
  SEARCH_FEELINGS_RESULT_CARD,
} from '@/styles/search-feelings-styles';

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
    <nav className={SEARCH_FEELINGS_NAVBAR.container}>
      <Link href="/dashboard" className={SEARCH_FEELINGS_NAVBAR.logoLink}>
        <svg className={SEARCH_FEELINGS_NAVBAR.logoSvg} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span className={SEARCH_FEELINGS_NAVBAR.logoSpan}>Wordstowellness</span>
      </Link>

      <div className={SEARCH_FEELINGS_NAVBAR.navLinks}>
        <Link href="/dashboard" className={SEARCH_FEELINGS_NAVBAR.navLink}>Dashboard</Link>
        <Link href="/dashboard-letters" className={SEARCH_FEELINGS_NAVBAR.navLink}>Browse letters</Link>
        <Link href="/search-feelings" className={SEARCH_FEELINGS_NAVBAR.navLinkActive}>Search by feelings</Link>
        <Link href="/improve-message" className={SEARCH_FEELINGS_NAVBAR.navLink}>Improve my message</Link>
        <Link href="/pricing" className={SEARCH_FEELINGS_NAVBAR.navLink}>Pricing</Link>
      </div>

      <div className={SEARCH_FEELINGS_NAVBAR.userActions}>
        <PlanStatusBadge user={user} />
        <button onClick={handleLogout} className={SEARCH_FEELINGS_NAVBAR.logoutButton}>
          <svg className={SEARCH_FEELINGS_NAVBAR.logoutIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className={SEARCH_FEELINGS_LAYOUT.loadingContainer}>
        <div className={SEARCH_FEELINGS_LOADING.content}>
          <div className={SEARCH_FEELINGS_LOADING.spinner}></div>
          <p className={SEARCH_FEELINGS_LOADING.text}>Loading search data...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className={SEARCH_FEELINGS_LAYOUT.container}>
      <Navbar user={userData} />

      <main className={SEARCH_FEELINGS_LAYOUT.main}>
        <div className={SEARCH_FEELINGS_HEADER.container}>
          <div className={SEARCH_FEELINGS_HEADER.backButton}>
            <Link href="/dashboard" className={SEARCH_FEELINGS_HEADER.backButtonInner}>
              <svg className={SEARCH_FEELINGS_HEADER.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
          
          <div className={SEARCH_FEELINGS_HEADER.heroContainer}>
            <div className={SEARCH_FEELINGS_HEADER.heroContent}>
              <div className={SEARCH_FEELINGS_HEADER.heroText}>
                <p className={SEARCH_FEELINGS_HEADER.heroBadge}>Search by feelings</p>
                <h1 className={SEARCH_FEELINGS_HEADER.heroTitle}>Find letters that match your mood.</h1>
                <p className={SEARCH_FEELINGS_HEADER.heroDescription}>
                  Enter how you feel or what you want to say, and we&apos;ll surface the most relevant letters from the library.
                </p>
              </div>
              <div className={SEARCH_FEELINGS_HEADER.statsBadge}>
                {letters.length} letters searchable across {categories.length} categories
              </div>
            </div>

            <div className={SEARCH_FEELINGS_HEADER.searchContainer}>
              <div className={SEARCH_FEELINGS_HEADER.searchIcon}>
                <svg className={SEARCH_FEELINGS_HEADER.searchIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search feelings, tone, topic, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={SEARCH_FEELINGS_HEADER.searchInput}
              />
            </div>
          </div>
        </div>

        {!normalizedInput ? (
          <div className={SEARCH_FEELINGS_EMPTY.container}>
            <p className={SEARCH_FEELINGS_EMPTY.title}>Start with a feeling or keyword</p>
            <p className={SEARCH_FEELINGS_EMPTY.description}>Try words like &quot;hopeful&quot;, &quot;healing&quot;, &quot;confused&quot;, or &quot;grief&quot; to find letters that resonate.</p>
          </div>
        ) : filteredLetters.length === 0 ? (
          <div className={SEARCH_FEELINGS_NO_RESULTS.container}>
            <p className={SEARCH_FEELINGS_NO_RESULTS.title}>No matches found</p>
            <p className={SEARCH_FEELINGS_NO_RESULTS.description}>Try a different feeling, topic, or emotion.</p>
          </div>
        ) : (
          <div className={SEARCH_FEELINGS_RESULTS_GRID.container}>
            {filteredLetters.map((letter) => (
              <div key={letter._id} className={SEARCH_FEELINGS_RESULT_CARD.container}>
                <div className={SEARCH_FEELINGS_RESULT_CARD.header}>
                  <span className={SEARCH_FEELINGS_RESULT_CARD.topicName}>{letter.topic?.name || 'Letter'}</span>
                  <span className={SEARCH_FEELINGS_RESULT_CARD.categoryName}>{letter.category?.name || letter.subcategory?.name || 'Unknown'}</span>
                </div>
                <h2 className={SEARCH_FEELINGS_RESULT_CARD.title}>{letter.title || 'Untitled letter'}</h2>
                <p className={SEARCH_FEELINGS_RESULT_CARD.content}>{letter.content || 'No description available.'}</p>
                <div className={SEARCH_FEELINGS_RESULT_CARD.footer}>
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
      <div className={SEARCH_FEELINGS_LAYOUT.loadingContainer}>
        <div className={SEARCH_FEELINGS_LOADING.content}>
          <div className={SEARCH_FEELINGS_LOADING.spinner}></div>
          <p className={SEARCH_FEELINGS_LOADING.text}>Loading search page...</p>
        </div>
      </div>
    }>
      <SearchByFeelingsPage />
    </Suspense>
  );
}