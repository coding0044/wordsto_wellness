// styles/subcategories-styles.js

export const SUBCATEGORIES_LAYOUT = {
  container: "min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50",
  loadingContainer: "min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center",
  main: "max-w-6xl mx-auto px-6 py-8",
  errorContainer: "min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center px-6",
  errorCard: "max-w-xl text-center bg-white p-10 rounded-3xl shadow-lg border border-gray-100",
  errorTitle: "text-3xl font-bold text-gray-900 mb-4",
  errorMessage: "text-gray-600 mb-6",
  errorButton: "inline-flex items-center justify-center px-6 py-3 rounded-full bg-sky-600 text-white font-medium hover:bg-sky-700 transition-colors",
};

export const SUBCATEGORIES_LOADING = {
  content: "space-y-4",
  spinner: "w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto",
  text: "text-gray-600 text-center",
};

export const SUBCATEGORIES_NAVBAR = {
  container: "flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50",
  logoLink: "flex items-center gap-2",
  logoSvg: "w-6 h-6 text-sky-500",
  logoSpan: "text-xl font-semibold text-gray-800",
  navLinks: "hidden md:flex items-center gap-1",
  navLink: "px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors",
  navLinkActive: "px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-medium text-sm",
  userActions: "flex items-center gap-3",
  logoutButton: "flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors",
  logoutIcon: "w-4 h-4",
};

export const SUBCATEGORIES_BREADCRUMB = {
  container: "flex items-center gap-2 mb-4 text-sm text-gray-500",
  link: "hover:text-sky-600 transition-colors",
  separator: "",
  current: "text-gray-900 font-medium",
};

export const SUBCATEGORIES_HEADER = {
  container: "mb-8",
  backButton: "flex items-center gap-3 mb-4",
  backButtonInner: "flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors",
  backIcon: "w-5 h-5",
  contentContainer: "flex items-center gap-4 mb-2",
  iconContainer: "w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl shadow-md",
  title: "text-3xl font-bold text-gray-900",
  subtitle: "text-gray-600",
};

export const SUBCATEGORIES_SEARCH = {
  container: "relative mb-8",
  searchIcon: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none",
  searchIconSvg: "w-5 h-5 text-gray-400",
  input: "block w-full pl-12 pr-5 py-3.5 text-base border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 bg-white",
};

export const SUBCATEGORIES_GRID = {
  container: "grid gap-6 md:grid-cols-2 lg:grid-cols-3",
  loadingContainer: "flex items-center justify-center py-20",
  emptyContainer: "text-center py-16",
  emptyIcon: "w-24 h-24 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center text-4xl mb-4",
  emptyTitle: "text-xl font-semibold text-gray-900 mb-2",
  emptyDescription: "text-gray-600",
};

export const SUBCATEGORIES_CARD = {
  link: "group block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all duration-200",
  headerContainer: "flex items-start justify-between mb-4",
  iconContainer: "w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl shadow-md group-hover:scale-105 transition-transform",
  badge: "px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold uppercase tracking-wide",
  title: "text-lg font-semibold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2",
  description: "text-sm mb-4 line-clamp-3 leading-relaxed",
  descriptionEmpty: "text-gray-400 italic",
  footer: "flex items-center justify-between pt-4 border-t border-gray-100",
  date: "text-xs text-gray-500",
  exploreLink: "flex items-center space-x-1 text-emerald-600 font-semibold text-sm group-hover:translate-x-1 transition-transform",
};