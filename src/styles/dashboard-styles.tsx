// styles/dashboard-styles.js

export const DASHBOARD_LAYOUT = {
  container: "min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50",
  loadingContainer: "min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center",
};

export const DASHBOARD_LOADING = {
  content: "space-y-4",
  spinner: "w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto",
  text: "text-gray-600 text-center",
};

export const DASHBOARD_WELCOME = {
  container: "mb-8",
  badge: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 mb-3",
  titleContainer: "flex flex-col md:flex-row md:items-end md:justify-between gap-4",
  title: "text-3xl font-bold text-gray-900 mb-2",
  subtitle: "text-gray-600",
  careTag: "inline-flex items-center gap-2 px-3 py-2 bg-rose-50 rounded-xl text-rose-600",
  careIcon: "w-5 h-5",
  careText: "text-sm font-medium",
};

export const DASHBOARD_STATS = {
  container: "grid gap-6 md:grid-cols-3 mb-12",
  card: "bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200",
  cardHeader: "flex items-center justify-between mb-3",
  label: "text-sm font-medium text-gray-500",
  value: "text-2xl font-bold text-gray-900",
  iconPlan: "w-5 h-5 text-indigo-500",
  iconUses: "w-5 h-5 text-emerald-500",
  iconResets: "w-5 h-5 text-amber-500",
};

export const DASHBOARD_TOOLS = {
  container: "mb-12",
  header: "flex items-center justify-between mb-6",
  title: "text-xl font-semibold text-gray-900",
  count: "text-sm text-gray-500",
  gridContainer: "grid gap-6 md:grid-cols-2 lg:grid-cols-3",
};

export const DASHBOARD_TOOL_CARD = {
  link: "group block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all duration-200",
  headerContainer: "flex items-start justify-between mb-4",
  iconLetters: "w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl shadow-md group-hover:scale-105 transition-transform",
  iconLettersIcon: "w-7 h-7",
  iconSearch: "w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl shadow-md group-hover:scale-105 transition-transform",
  iconSearchIcon: "w-7 h-7",
  iconImprove: "w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-2xl shadow-md group-hover:scale-105 transition-transform",
  iconImproveIcon: "w-7 h-7",
  badge: "px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-semibold uppercase tracking-wide",
  title: "text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors",
  description: "text-gray-600 text-sm mb-4 leading-relaxed",
  button: "inline-flex items-center justify-between w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-xl font-medium text-sm group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200",
  buttonIcon: "w-4 h-4 group-hover:translate-x-1 transition-transform",
};

export const DASHBOARD_BANNER = {
  container: "bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg overflow-hidden",
  contentWrapper: "px-6 py-8 md:flex md:items-center md:justify-between",
  textSection: "flex items-start space-x-4 mb-4 md:mb-0",
  iconContainer: "w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center",
  icon: "w-6 h-6 text-white",
  title: "text-lg font-semibold text-white mb-1",
  description: "text-emerald-100 text-sm max-w-md",
  progressContainer: "mt-3 w-32 h-1.5 bg-white/20 rounded-full overflow-hidden",
  progressBar: "w-1/3 h-full bg-white rounded-full",
  ctaButton: "inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-600 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-colors shadow-md",
  ctaIcon: "w-4 h-4",
};