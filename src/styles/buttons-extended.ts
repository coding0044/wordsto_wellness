/**
 * Extended button and action element styles
 * Specific button variants used throughout the application
 */

// Action buttons in dashboard and pages
export const ACTION_BUTTONS = {
  dashboardCardButton: 'w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors',
  dashboardActionButton: 'px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-colors',
  verifyButton: 'w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed',
  submitButton: 'w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-xl transition duration-200 disabled:opacity-50',
  socialButton: 'mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition',
  
  // Error page buttons
  errorPrimary: 'inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700',
  errorSecondary: 'inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50',
  
  // Specialized buttons
  improvePagePrimary: 'px-6 py-3 rounded-full bg-sky-600 text-white font-semibold hover:bg-sky-700 transition',
  improvePageSecondary: 'px-6 py-3 rounded-full border border-sky-200 text-sky-700 font-semibold hover:bg-sky-50 transition',
};

// OTP input specific
export const OTP_INPUTS = {
  otpField: 'h-12 w-12 text-center text-xl font-bold border border-gray-200 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all',
};

// Settings and profile styles
export const PROFILE_STYLES = {
  uploadButton: 'px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg text-xs font-semibold text-center transition-colors',
};

// Status and alert messages
export const STATUS_MESSAGES = {
  successMessage: 'mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700',
  errorMessage: 'mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700',
};
