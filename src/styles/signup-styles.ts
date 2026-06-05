// styles/search-feelings-styles.js

export const SEARCH_FEELINGS_LAYOUT = {
  container: "min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50",
  loadingContainer: "min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center",
  main: "max-w-6xl mx-auto px-6 py-8",
};

export const SEARCH_FEELINGS_LOADING = {
  content: "space-y-4",
  spinner: "w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto",
  text: "text-gray-600 text-center",
};

export const SEARCH_FEELINGS_NAVBAR = {
  container: "flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50",
  logoLink: "flex items-center gap-2",
  logoSvg: "w-6 h-6 text-sky-500",
  logoSpan: "text-xl font-light text-gray-700",
  navLinks: "hidden md:flex items-center gap-1",
  navLink: "px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors",
  navLinkActive: "px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-medium text-sm",
  userActions: "flex items-center gap-3",
  logoutButton: "flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors",
  logoutIcon: "w-4 h-4",
};

export const SEARCH_FEELINGS_HEADER = {
  container: "mb-10",
  backButton: "flex items-center gap-3 mb-4",
  backButtonInner: "flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors",
  backIcon: "w-5 h-5",
  heroContainer: "bg-white rounded-3xl p-8 shadow-sm border border-gray-100",
  heroContent: "flex items-start justify-between gap-6 flex-wrap",
  heroText: "max-w-3xl",
  heroBadge: "text-sky-600 font-medium uppercase tracking-wide mb-2",
  heroTitle: "text-4xl font-bold text-gray-900 mb-4",
  heroDescription: "text-gray-600 leading-relaxed",
  statsBadge: "rounded-3xl bg-sky-50 p-4 text-sky-700 text-sm font-medium",
  searchContainer: "mt-8 relative",
  searchIcon: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none",
  searchIconSvg: "w-5 h-5 text-gray-400",
  searchInput: "block w-full rounded-3xl border border-gray-200 bg-white py-4 pl-14 pr-5 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 transition",
};

export const SEARCH_FEELINGS_EMPTY = {
  container: "rounded-3xl bg-white p-10 shadow-sm border border-gray-100 text-center",
  title: "text-lg font-semibold text-gray-900 mb-2",
  description: "text-gray-600",
};

export const SEARCH_FEELINGS_NO_RESULTS = {
  container: "rounded-3xl bg-white p-10 shadow-sm border border-gray-100 text-center",
  title: "text-xl font-semibold text-gray-900 mb-3",
  description: "text-gray-600",
};

export const SEARCH_FEELINGS_RESULTS_GRID = {
  container: "grid gap-6 md:grid-cols-2 lg:grid-cols-3",
};

export const SEARCH_FEELINGS_RESULT_CARD = {
  container: "bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition",
  header: "flex items-center justify-between gap-3 mb-4",
  topicName: "text-sm font-semibold text-sky-600",
  categoryName: "text-xs text-gray-500",
  title: "text-lg font-semibold text-gray-900 mb-3 line-clamp-2",
  content: "text-sm text-gray-600 mb-5 line-clamp-4",
  footer: "flex items-center justify-between text-xs text-gray-500",
  subcategoryName: "",
  date: "",
};