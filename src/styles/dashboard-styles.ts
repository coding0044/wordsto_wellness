/**
 * Dashboard Page Tailwind Class Constants
 * Extracted from dashboard/page.tsx for cleaner code
 */

// ============ Global/Layout ============
export const DASHBOARD_LAYOUT = {
  container: 'min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50',
  loadingContainer: 'min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center',
  main: 'max-w-6xl mx-auto px-6 py-8',
};

// ============ Navigation/Navbar ============
export const DASHBOARD_NAVBAR = {
  container: 'flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50',
  logo: 'flex items-center gap-2',
  logoIcon: 'w-6 h-6 text-sky-500',
  logoText: 'text-xl font-light text-gray-700',
  linksContainer: 'hidden md:flex items-center gap-1',
  linkActive: 'px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-medium text-sm',
  linkInactive: 'px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors',
  userActionsContainer: 'flex items-center gap-3',
  settingsButton: 'flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg text-sm font-medium transition-all cursor-pointer',
  settingsIcon: 'w-4 h-4',
};

// ============ Loading State ============
export const DASHBOARD_LOADING = {
  content: 'space-y-4',
  spinner: 'w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto',
  text: 'text-gray-600 text-center',
};

// ============ Welcome Section ============
export const DASHBOARD_WELCOME = {
  container: 'mb-8',
  badge: 'text-sky-600 font-medium mb-1',
  titleContainer: 'flex items-center justify-between flex-wrap gap-4',
  titleSection: '',
  title: 'text-3xl font-bold text-gray-900 mb-2',
  subtitle: 'text-gray-600',
  careTag: 'flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100',
  careIcon: 'w-4 h-4 text-rose-500',
  careText: 'text-sm font-medium text-gray-700',
};

// ============ Stats Cards ============
export const DASHBOARD_STATS = {
  container: 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-10',
  card: 'bg-white rounded-2xl p-6 shadow-sm border border-gray-100',
  cardHeader: 'flex items-start justify-between mb-4',
  label: 'text-xs font-semibold text-gray-500 uppercase tracking-wide',
  value: 'text-2xl font-bold text-gray-900',
  iconPlan: 'w-5 h-5 text-sky-500',
  iconUses: 'w-5 h-5 text-emerald-500',
  iconResets: 'w-5 h-5 text-blue-500',
};

// ============ Tools Section ============
export const DASHBOARD_TOOLS = {
  container: 'mb-6',
  header: 'flex items-center justify-between mb-6',
  title: 'text-lg font-semibold text-gray-900',
  count: 'text-sm text-gray-500',
  gridContainer: 'grid grid-cols-1 md:grid-cols-3 gap-6',
};

// ============ Tool Cards ============
export const DASHBOARD_TOOL_CARD = {
  link: 'group block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-sky-200 transition-all duration-200',
  headerContainer: 'flex items-start justify-between mb-4',
  badge: 'px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium uppercase tracking-wide',
  title: 'text-lg font-semibold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors',
  description: 'text-sm text-gray-600 mb-6 leading-relaxed',
  button: 'w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors',
  buttonIcon: 'w-4 h-4',
  
  // Icon containers
  iconLetters: 'w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center',
  iconLettersIcon: 'w-6 h-6 text-sky-600',
  iconSearch: 'w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center',
  iconSearchIcon: 'w-6 h-6 text-emerald-600',
  iconImprove: 'w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center',
  iconImproveIcon: 'w-6 h-6 text-rose-600',
};

// ============ Plan Banner ============
export const DASHBOARD_BANNER = {
  container: 'mt-10 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100',
  contentWrapper: 'flex items-center justify-between flex-wrap gap-4',
  textSection: 'flex items-start gap-4',
  iconContainer: 'w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm',
  icon: 'w-5 h-5 text-sky-500',
  title: 'font-semibold text-gray-900 mb-1',
  description: 'text-sm text-gray-600 max-w-md',
  progressContainer: 'mt-3 w-32 h-1.5 bg-white rounded-full overflow-hidden',
  progressBar: 'w-1/3 h-full bg-sky-500 rounded-full',
  ctaButton: 'px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-colors',
  ctaIcon: 'w-4 h-4',
};
