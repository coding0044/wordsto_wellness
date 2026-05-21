'use client';

import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">Something went wrong</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">An unexpected error occurred.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Please try reloading the page, or return to the homepage.
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-slate-50 p-5 text-sm text-slate-700">
          <div className="font-semibold text-slate-900">Error details</div>
          <pre className="mt-2 whitespace-pre-wrap break-words">{error?.message ?? 'No message available.'}</pre>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset?.()}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Go to home
          </Link>
        </div>
      </div>
    </div>
  );
}
