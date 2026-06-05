'use client';

import Link from 'next/link';
import { PAGE_LAYOUTS, ACTION_BUTTONS } from '@/styles';

export default function GlobalError({ error, reset }: { error: Error | null; reset?: () => void }) {
  return (
    <div className={PAGE_LAYOUTS.errorPage}>
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
            className={ACTION_BUTTONS.errorPrimary}
          >
            Try again
          </button>
          <Link
            href="/"
            className={ACTION_BUTTONS.errorSecondary}
          >
            Go to home
          </Link>
        </div>
      </div>
    </div>
  );
}
