// styles/improve-message-styles.js

export const IMPROVE_MESSAGE_LAYOUT = {
  container: "min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50",
  loadingContainer: "min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center",
  main: "max-w-4xl mx-auto px-6 py-16",
};

export const IMPROVE_MESSAGE_LOADING = {
  content: "space-y-4",
  spinner: "w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto",
  text: "text-gray-600 text-center",
};

export const IMPROVE_MESSAGE_NAVBAR = {
  container: "flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50",
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

export const IMPROVE_MESSAGE_CARD = {
  container: "bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center",
  iconContainer: "mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-700 shadow-sm",
  icon: "w-8 h-8",
  title: "text-3xl font-bold text-gray-900 mb-4",
  description: "text-gray-600 mb-8",
  buttonContainer: "flex flex-col sm:flex-row justify-center gap-4",
  primaryButton: "px-6 py-3 rounded-full bg-sky-600 text-white font-semibold hover:bg-sky-700 transition",
  secondaryButton: "px-6 py-3 rounded-full border border-sky-200 text-sky-700 font-semibold hover:bg-sky-50 transition",
};