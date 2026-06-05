// styles/pricing-styles.js

export const PRICING_LAYOUT = {
  container: "min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50",
  loadingContainer: "min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center",
  main: "max-w-7xl mx-auto px-6 py-12",
};

export const PRICING_LOADING = {
  content: "space-y-4",
  spinner: "w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto",
  text: "text-gray-600 text-center",
};

export const PRICING_NAVBAR = {
  container: "flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200",
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

export const PRICING_HEADER = {
  container: "mb-12",
  backButton: "flex items-center gap-3 mb-6",
  backButtonInner: "flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors",
  backIcon: "w-5 h-5",
  textContainer: "text-center mb-12",
  badge: "text-sky-600 font-light uppercase tracking-wide mb-2",
  title: "text-5xl font-light text-gray-900 mb-4",
  description: "text-xl text-gray-600 font-light max-w-2xl mx-auto",
};

export const PRICING_CARD = {
  container: (popular, color) => `relative rounded-3xl border-2 overflow-hidden transition-all duration-300 ${
    popular ? 'border-amber-200 bg-amber-50 lg:scale-105' : 'border-gray-200 bg-white'
  } shadow-lg hover:shadow-xl`,
  popularBadge: "absolute top-0 left-0 right-0 bg-amber-500 text-white text-center py-1 text-sm font-semibold",
  contentContainer: (popular) => `p-8 ${popular ? 'pt-12' : ''}`,
  title: (color) => `text-2xl font-bold mb-2 ${
    color === 'amber' ? 'text-amber-600' :
    color === 'purple' ? 'text-purple-600' :
    'text-sky-600'
  }`,
  description: "text-gray-600 text-sm mb-6",
  priceContainer: "mb-6",
  price: "text-4xl font-bold text-gray-900",
  pricePeriod: "text-gray-600 ml-1",
  button: (isCurrentPlan, ctaStyle) => `w-full py-3 rounded-full font-semibold mb-8 transition-colors duration-200 ${
    isCurrentPlan
      ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
      : ctaStyle
  }`,
  featuresTitle: "text-xs text-gray-500 uppercase font-semibold",
  featuresContainer: "space-y-4",
  featureItem: "flex items-start gap-3",
  featureIcon: (color) => `w-5 h-5 flex-shrink-0 mt-0.5 ${
    color === 'amber' ? 'text-amber-500' :
    color === 'purple' ? 'text-purple-500' :
    'text-sky-500'
  }`,
  featureText: "text-gray-700 text-sm",
};

export const PRICING_FAQ = {
  container: "bg-white rounded-3xl p-10 shadow-sm border border-gray-100",
  title: "text-2xl font-bold text-gray-900 mb-6",
  questionContainer: "space-y-6",
  questionItem: "",
  questionTitle: "text-lg font-semibold text-gray-900 mb-2",
  questionAnswer: "text-gray-600",
};