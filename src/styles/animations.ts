/**
 * Animation and loading state Tailwind utilities
 * Reusable animation classes for spinners, transitions, etc.
 */

// Loading spinners and animations
export const LOADERS = {
  spinnerLarge: 'mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500',
  spinnerMedium: 'w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto',
  spinnerMediumWithMargin: 'w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-4',
  spinnerSmall: 'w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin',
  spinnerInline: 'h-5 w-5 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500',
};

// Transition and hover effects
export const TRANSITIONS = {
  default: 'transition-all duration-200',
  colors: 'transition-colors',
  smooth: 'transition-all duration-300',
  fast: 'transition duration-200',
  slowColors: 'transition-all duration-300',
  hover: 'hover:bg-gray-100 rounded-lg transition-colors',
  allSmooth: 'transition-all duration-200',
};

// Gradient animations
export const GRADIENT_ANIMATIONS = {
  shimmer: 'animate-pulse',
  fadeIn: 'animate-fadeIn',
};

// Avatar and profile animations
export const AVATAR_ANIMATIONS = {
  profileRing: 'absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center',
  profileGradient: 'w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center overflow-hidden shadow-md',
};
