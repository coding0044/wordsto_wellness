// styles/login-styles.js

export const LOGIN_LAYOUT = {
  container: "min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center px-4 py-12",
  wrapper: "w-full max-w-md",
};

export const LOGIN_LOGO = {
  container: "flex justify-center mb-6",
  iconWrapper: "w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center",
  icon: "w-7 h-7 text-sky-500",
};

export const LOGIN_TITLE = {
  container: "text-center mb-8",
  title: "text-2xl font-semibold text-gray-900 mb-2",
  subtitle: "text-sm text-gray-500",
};

export const LOGIN_CARD = {
  container: "bg-white rounded-3xl shadow-lg p-8",
  error: "mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",
};

export const LOGIN_FORM = {
  container: "space-y-5",
  fieldContainer: "",
  label: "block text-sm font-medium text-gray-700 mb-2",
  input: "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all",
  passwordContainer: "relative",
  passwordToggle: "absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700",
  forgotPasswordLink: "text-sm text-sky-600 hover:text-sky-700",
  submitButton: "w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed",
};

export const LOGIN_DIVIDER = {
  container: "mt-6 relative",
  line: "absolute inset-0 flex items-center",
  lineInner: "w-full border-t border-gray-200",
  textContainer: "relative flex justify-center text-sm",
  text: "px-2 bg-white text-gray-500",
};

export const LOGIN_GOOGLE_BUTTON = {
  button: "mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed",
  text: "text-gray-700 font-medium",
};

export const LOGIN_FOOTER = {
  container: "mt-6 text-center",
  text: "text-sm text-gray-600",
  link: "text-sky-600 hover:text-sky-700 font-medium",
};