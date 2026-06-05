// styles/reset-password-styles.js

export const RESET_PASSWORD_LAYOUT = {
  container: "min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center px-4 py-12",
  wrapper: "w-full max-w-md",
  loadingContainer: "min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center",
  loadingContent: "text-center",
  loadingSpinner: "w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-4",
  loadingText: "text-gray-600",
};

export const RESET_PASSWORD_LOGO = {
  container: "flex justify-center mb-6",
  iconWrapper: "w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center",
  icon: "w-7 h-7 text-sky-500",
};

export const RESET_PASSWORD_TITLE = {
  container: "text-center mb-8",
  title: "text-2xl font-semibold text-gray-900 mb-2",
  subtitle: "text-sm text-gray-500",
};

export const RESET_PASSWORD_CARD = {
  container: "bg-white rounded-3xl shadow-lg p-8",
  error: "mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",
  success: "text-center",
  successIconWrapper: "w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-4",
  successIcon: "w-7 h-7 text-sky-500",
  successTitle: "text-xl font-bold text-gray-900 mb-2",
  successMessage: "text-gray-600 mb-2",
  successRedirect: "text-sm text-gray-500",
  invalidContainer: "text-center",
  invalidTitle: "text-xl font-bold text-gray-900 mb-2",
  invalidMessage: "text-gray-600 mb-6",
  invalidButton: "inline-block px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold transition",
};

export const RESET_PASSWORD_FORM = {
  container: "space-y-5",
  fieldContainer: "",
  label: "block text-sm font-medium text-gray-700 mb-2",
  inputWrapper: "relative",
  input: "w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all",
  passwordToggle: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer",
  toggleIcon: "w-5 h-5",
  submitButton: "w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed",
};

export const RESET_PASSWORD_FOOTER = {
  container: "mt-6 text-center",
  link: "text-sm text-sky-600 hover:text-sky-700 font-medium",
};