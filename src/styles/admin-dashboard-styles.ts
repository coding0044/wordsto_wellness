// styles/admin-dashboard-styles.js

export const ADMIN_LAYOUT = {
  container: "flex h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200",
  main: "flex-1 overflow-y-auto",
};

export const ADMIN_SIDEBAR = {
  sidebar: "w-72 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl flex flex-col",
  logo: "p-6 border-b border-white/10",
  logoBox: "flex items-center gap-3",
  logoIcon: "w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg",
  logoText: "text-white font-bold text-lg tracking-tight",
  logoSubText: "text-white/40 text-xs",
  search: "p-5 border-b border-white/10",
  searchInput: "w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-white/80 placeholder-white/30 text-sm focus:outline-none focus:border-indigo-400 transition-colors",
  nav: "flex-1 p-4 space-y-1 overflow-y-auto",
  navLabel: "text-white/30 text-xs font-semibold uppercase tracking-wider px-3 mb-3",
  userSection: "p-5 border-t border-white/10 space-y-4",
  userBox: "flex items-center gap-3",
  userAvatar: "w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm",
  logoutBtn: "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm font-medium",
};

export const ADMIN_HEADER = {
  topbar: "bg-white/80 backdrop-blur-sm border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10",
};

export const ADMIN_CONTENT = {
  area: "p-8",
};

export const ADMIN_LOADING = {
  screen: "min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center",
  content: "space-y-4 text-center",
  spinner: "w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto",
  text: "text-gray-600 text-center",
  icon: "animate-pulse",
};

export const ADMIN_STATS = {
  grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8",
  card: "bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group",
  cardHeader: "flex items-center justify-between mb-4",
  iconWrapper: (from, to) => `w-12 h-12 rounded-xl bg-gradient-to-br from-${from}/10 to-${to}/10 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`,
  icon: (color) => `w-6 h-6 text-${color}`,
  trendBadge: (bg, text) => `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-${bg} text-${text}`,
  value: "text-3xl font-bold text-gray-900",
  label: "text-sm text-gray-500 mt-1",
};

export const ADMIN_TABLE = {
  container: "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden",
  loading: "flex flex-col items-center justify-center py-20",
  spinner: (color) => `w-10 h-10 border-4 border-t-${color}-500 border-gray-200 rounded-full animate-spin mb-3`,
  empty: "flex flex-col items-center justify-center py-16 text-center",
  table: "min-w-full divide-y divide-gray-200",
  tableHead: "bg-gray-50",
  th: "px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider",
  td: "px-6 py-4 whitespace-nowrap text-sm",
};

export const ADMIN_BUTTONS = {
  actionBase: "p-2 rounded-lg transition-colors cursor-pointer",
  editBtn: "text-blue-600 hover:bg-blue-50",
  deleteBtn: "text-red-600 hover:bg-red-50",
};

export const ADMIN_BADGES = {
  badge: (bg, text) => `inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-${bg} text-${text}`,
};

export const ADMIN_AVATARS = {
  avatar: (from, to) => `w-8 h-8 rounded-full bg-gradient-to-br from-${from} to-${to} flex items-center justify-center`,
  emptyIcon: (bg) => `w-16 h-16 rounded-full bg-${bg} flex items-center justify-center`,
};

export const ADMIN_PAGINATION = {
  container: "px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4",
  info: "text-sm text-gray-500",
  buttonGroup: "flex items-center gap-2 flex-wrap",
  buttonBase: (disabled) => `inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`,
  pageButton: (active, from, to) => `px-3 py-2 rounded-lg text-sm font-medium transition-all ${active ? `bg-gradient-to-r from-${from} to-${to} text-white shadow-md` : 'text-gray-600 hover:bg-gray-100'}`,
  ellipsis: "px-3 py-2 text-gray-400",
};

export const ADMIN_FORM = {
  group: "space-y-5",
  label: "block text-sm font-semibold text-gray-700 mb-2",
  labelLarge: "text-lg font-bold text-gray-900",
  inputBase: "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400",
  textarea: "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-vertical",
  select: "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-gray-900 cursor-pointer bg-white",
};

export const ADMIN_MODAL = {
  overlay: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4",
  container: "bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto",
  header: "sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between",
  closeBtn: "w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors",
  buttonGroup: "flex gap-3 pt-4",
  submitBtn: (from, to) => `flex-1 bg-gradient-to-r from-${from} to-${to} text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all`,
  cancelBtn: "flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-all",
};

export const ADMIN_SEARCH = {
  container: "relative",
  icon: "absolute left-3 top-1/2 -translate-y-1/2",
};

export const ADMIN_NAV = {
  navButton: (active, from, to) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? `bg-gradient-to-r from-${from}/20 to-${to}/20 text-white` : 'text-white/60 hover:bg-white/5 hover:text-white'}`,
  navButtonText: (active) => `text-sm font-medium flex-1 text-left ${active ? 'text-white' : ''}`,
};

export const ADMIN_USER = {
  email: "text-white/80 text-sm font-medium truncate",
};

export const ADMIN_ERROR = {
  banner: "max-w-6xl mx-auto mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm",
};

export const ADMIN_TEXT = {
  muted: "text-gray-500 text-sm text-center mt-2",
  mutedMd: "text-gray-500 text-sm mt-2",
};

export const ADMIN_INDICATOR = {
  dot: (gradient) => `inline-block w-2 h-2 rounded-full mr-2 bg-gradient-to-r ${gradient}`,
};

export const ADMIN_PASSWORD = {
  container: "relative",
  toggleBtn: "absolute right-3 top-1/2 -translate-y-1/2 text-sky-600 text-sm font-medium hover:text-sky-700",
  hint: "text-xs text-gray-400 mt-1",
};

export const ADMIN_NOTIFICATION = {
  container: "fixed top-20 right-6 z-50 animate-slideIn",
  box: (type) => `px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`,
};

export const ADMIN_CONTAINERS = {
  scrollable: "overflow-x-auto",
};

export const ADMIN_WELCOME = {
  container: "mb-8",
  title: "text-3xl font-bold text-gray-900",
  subtitle: "text-gray-500 mt-1",
};

export const ADMIN_CONTENT_BREAKDOWN = {
  container: "bg-white rounded-2xl p-6 border border-gray-100 shadow-sm",
  header: "flex items-center justify-between mb-4",
  title: "text-lg font-semibold text-gray-900",
  item: "mb-4",
  itemHeader: "flex justify-between text-sm font-medium text-gray-600 mb-2",
  itemValue: (color) => `text-${color}-600`,
  progressBar: "h-2 bg-gray-100 rounded-full overflow-hidden",
  progressFill: (color) => `h-full rounded-full bg-gradient-to-r from-${color}-400 to-${color}-500 transition-all duration-700`,
};

export const ADMIN_QUICK_ACTIONS = {
  container: "bg-white rounded-2xl p-6 border border-gray-100 shadow-sm",
  title: "text-lg font-semibold text-gray-900 mb-4",
  buttonContainer: "space-y-3",
  button: (bg) => `w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed bg-${bg} hover:shadow-md transition-all duration-200 text-left group`,
  buttonIcon: (from, to) => `w-9 h-9 rounded-lg bg-gradient-to-br from-${from} to-${to} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`,
  buttonLabel: (text) => `text-sm font-semibold text-${text}`,
  buttonArrow: (from) => `ml-auto text-${from} opacity-0 group-hover:opacity-100 transition-opacity`,
};

export const ADMIN_PAGE_HEADER = {
  container: "flex items-end justify-between mb-6 flex-wrap gap-4",
  title: "text-2xl font-bold text-gray-900",
  count: "text-sm font-medium text-gray-400 ml-2",
  subtitle: "text-gray-500 text-sm mt-1",
};

export const ADMIN_ADD_BUTTON = {
  button: (from, to) => `inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-${from} to-${to} text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200`,
  icon: "w-4 h-4",
};