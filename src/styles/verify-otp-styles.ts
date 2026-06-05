// styles/verify-otp-styles.js

export const VERIFY_OTP_LAYOUT = {
  container: "min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center px-4 py-12",
  wrapper: "w-full max-w-md",
  loadingContainer: "min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center",
  loadingContent: "text-center",
  loadingSpinner: "w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-4",
  loadingText: "text-gray-600",
};

export const VERIFY_OTP_LOGO = {
  container: "flex justify-center mb-6",
  iconWrapper: "w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center",
  icon: "w-7 h-7 text-sky-500",
};

export const VERIFY_OTP_TITLE = {
  container: "text-center mb-8",
  title: "text-2xl font-semibold text-gray-900 mb-2",
  subtitle: "text-sm text-gray-500",
};

export const VERIFY_OTP_CARD = {
  container: "bg-white rounded-3xl shadow-lg p-8",
  success: "mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700",
  error: "mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",
};

export const VERIFY_OTP_FORM = {
  container: "space-y-6",
  otpContainer: "flex justify-center gap-2",
  otpInput: "h-12 w-12 text-center text-xl font-bold border border-gray-200 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all",
  timerContainer: "text-center",
  timerText: "text-sm text-gray-600",
  timerBold: "font-bold text-sky-600",
  timerExpired: "text-red-600",
  submitButton: "w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed",
};

export const VERIFY_OTP_RESEND = {
  container: "mt-6 text-center",
  button: "text-sky-600 hover:text-sky-700 font-medium text-sm disabled:opacity-50",
  waitingText: "text-sm text-gray-500",
};

export const VERIFY_OTP_FOOTER = {
  container: "mt-6 text-center",
  link: "text-sm text-sky-600 hover:text-sky-700 font-medium",
};