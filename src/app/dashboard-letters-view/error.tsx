'use client';

import Link from 'next/link';

export default function DashboardLettersViewError({ error, reset }: { error: Error | null; reset?: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-slate-100 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl rounded-3xl border border-orange-200 bg-white p-10 shadow-xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-600">Page error</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Unable to load letters for this topic.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            There was a problem rendering this letters list. You can retry or go back to the dashboard.
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-orange-50 p-5 text-sm text-orange-800">
          <div className="font-semibold text-orange-900">Error details</div>
          <pre className="mt-2 whitespace-pre-wrap break-words">{error?.message ?? 'No message available.'}</pre>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset?.()}
            className="inline-flex items-center justify-center rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            Retry
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
