/**
 * Component-specific Tailwind utilities
 */

// ============ Buttons ============
export const BUTTONS = {
  base: 'font-medium text-xs transition-colors',
  primary: 'px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-lg shadow-md shadow-sky-500/20',
  primaryLarge: 'w-full px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-lg font-medium text-xs transition-all disabled:opacity-50 shadow-md shadow-sky-500/20',
  secondary: 'px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium text-xs transition-colors',
  secondaryLarge: 'w-full px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium text-xs transition-colors',
  danger: 'w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-xs transition-colors',
  outline: 'px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium text-xs transition-colors',
};

// ============ Form Inputs ============
export const INPUTS = {
  base: 'w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-400 transition-all text-sm',
  compact: 'w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-sm',
  label: 'block text-xs font-medium text-gray-700 mb-1',
  labelSm: 'block text-sm font-medium text-gray-700 mb-2',
};

// ============ Modals & Overlays ============
export const MODALS = {
  overlay: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4',
  overlayDark: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
  container: 'bg-white rounded-2xl max-w-md w-full shadow-2xl',
  containerLarge: 'bg-white rounded-3xl max-w-md w-full shadow-2xl p-8',
  scrollable: 'bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl',
};

// ============ Alerts & Messages ============
export const ALERTS = {
  errorBg: 'bg-red-50 text-red-700',
  errorBorder: 'rounded-xl border border-red-200',
  successBg: 'bg-green-50 text-green-700',
  successBorder: 'rounded-lg border border-green-200',
  infoBg: 'bg-blue-50 text-blue-700',
  base: 'p-3 rounded-lg text-xs flex items-center gap-2',
};
