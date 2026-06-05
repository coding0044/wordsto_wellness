// styles/global-error-styles.js

export const GLOBAL_ERROR_LAYOUT = {
  container: "min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center px-6 py-12",
  wrapper: "w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 shadow-xl",
};

export const GLOBAL_ERROR_CONTENT = {
  container: "text-center",
  badge: "text-sm font-semibold uppercase tracking-[0.3em] text-orange-500",
  title: "mt-4 text-3xl font-bold text-slate-900",
  description: "mt-3 text-sm leading-6 text-slate-600",
};

export const GLOBAL_ERROR_DETAILS = {
  container: "mt-8 rounded-2xl bg-slate-50 p-5 text-sm text-slate-700",
  title: "font-semibold text-slate-900",
  message: "mt-2 whitespace-pre-wrap break-words",
};

export const GLOBAL_ERROR_ACTIONS = {
  container: "mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center",
  resetButton: "inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700",
  homeLink: "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50",
};