/**
 * Layout and structural Tailwind utilities
 * Common layout patterns used across pages
 */

// Navigation and headers
export const NAVIGATION = {
  header: 'flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50',
  headerWithBorder: 'flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200',
  navLink: 'px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-light text-sm transition-colors',
  navLinkActive: 'px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-light text-sm hover:bg-sky-200 transition-colors',
  navButton: 'flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg text-sm font-medium transition-all cursor-pointer',
  navButtonAlt: 'flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors',
};

// Page backgrounds and full-screen layouts
export const PAGE_LAYOUTS = {
  fullScreen: 'min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center',
  fullScreenWithPadding: 'min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center px-4 py-12',
  errorPage: 'min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center px-6 py-12',
  dashboardLayout: 'min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50',
};

// Card and container layouts
export const CARD_LAYOUTS = {
  standardCard: 'bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-sky-200 transition-all duration-200',
  compactCard: 'bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition',
  expandedCard: 'bg-white rounded-3xl p-10 shadow-sm border border-gray-100',
  expandedCardCenter: 'bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center',
  tealGradientCard: 'mt-10 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100',
  shellCard: 'overflow-hidden rounded-[2rem] border border-white/10 bg-white/95 shadow-2xl shadow-slate-950/10 backdrop-blur-xl',
  whiteCard: 'bg-white rounded-3xl shadow-lg p-8',
};

// Search and input layouts
export const SEARCH_LAYOUTS = {
  searchInput: 'block w-full rounded-3xl border border-gray-200 bg-white py-4 pl-14 pr-5 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 transition',
  searchContainer: 'flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100',
};

// Grid and flex layouts
export const FLEX_LAYOUTS = {
  centerFlex: 'flex items-center justify-center',
  betweenFlex: 'flex items-center justify-between',
  centerColumn: 'flex flex-col items-center justify-center',
  gapSmall: 'gap-2',
  gapMedium: 'gap-3',
  gapLarge: 'gap-4',
};

// Modal and overlay layouts
export const MODAL_LAYOUTS = {
  backdrop: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4',
  modalHeader: 'flex items-center justify-between p-4 border-b border-gray-100',
};

// Badge and label layouts
export const BADGE_LAYOUTS = {
  categoryBadge: 'px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium uppercase tracking-wide',
  statusBadge: 'flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg text-sm font-medium transition-all cursor-pointer',
  iconBadge: 'w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center',
  iconBadgeMedium: 'mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-700 shadow-sm',
};
