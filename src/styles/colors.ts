/**
 * Color and gradient utilities
 */

export const GRADIENTS = {
  // Page backgrounds
  pageBg: 'min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50',
  dashboardBg: 'min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50',
  darkPageBg: 'min-h-screen bg-slate-950',
  
  // Header backgrounds
  headerGradient: 'bg-gradient-to-r from-slate-800 to-slate-700',
  modalGradient: 'bg-gradient-to-br from-gray-50 to-gray-100',
  
  // Button gradients
  primaryGradient: 'bg-gradient-to-r from-sky-500 to-sky-600',
  primaryGradientHover: 'hover:from-sky-600 hover:to-sky-700',
};

export const PLAN_COLORS = {
  Free: {
    text: 'text-sky-600',
    bg: 'bg-sky-50',
    hover: 'hover:bg-sky-100',
    border: 'border-sky-200',
    icon: 'text-sky-500',
  },
  Premium: {
    text: 'text-amber-600',
    bg: 'bg-amber-50',
    hover: 'hover:bg-amber-100',
    border: 'border-amber-200',
    icon: 'text-amber-500',
  },
  Pro: {
    text: 'text-purple-600',
    bg: 'bg-purple-50',
    hover: 'hover:bg-purple-100',
    border: 'border-purple-200',
    icon: 'text-purple-500',
  },
};

/**
 * Get color classes for a given plan
 */
export const getPlanColorClasses = (planName: string): (typeof PLAN_COLORS)[keyof typeof PLAN_COLORS] => {
  return PLAN_COLORS[planName as keyof typeof PLAN_COLORS] || PLAN_COLORS.Free;
};
