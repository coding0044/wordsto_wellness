'use client';

import Link from 'next/link';
import {
  GLOBAL_ERROR_LAYOUT,
  GLOBAL_ERROR_CONTENT,
  GLOBAL_ERROR_DETAILS,
  GLOBAL_ERROR_ACTIONS,
} from '@/styles/global-error-styles';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps) {
  return (
    <div className={GLOBAL_ERROR_LAYOUT.container}>
      <div className={GLOBAL_ERROR_LAYOUT.wrapper}>
        <div className={GLOBAL_ERROR_CONTENT.container}>
          <p className={GLOBAL_ERROR_CONTENT.badge}>
            Something went wrong
          </p>

          <h1 className={GLOBAL_ERROR_CONTENT.title}>
            An unexpected error occurred.
          </h1>

          <p className={GLOBAL_ERROR_CONTENT.description}>
            Please try reloading the page, or return to the homepage.
          </p>
        </div>

        <div className={GLOBAL_ERROR_DETAILS.container}>
          <div className={GLOBAL_ERROR_DETAILS.title}>
            Error details
          </div>

          <pre className={GLOBAL_ERROR_DETAILS.message}>
            {error?.message ?? 'No message available.'}
          </pre>
        </div>

        <div className={GLOBAL_ERROR_ACTIONS.container}>
          <button
            type="button"
            onClick={() => reset()}
            className={GLOBAL_ERROR_ACTIONS.resetButton}
          >
            Try again
          </button>

          <Link
            href="/"
            className={GLOBAL_ERROR_ACTIONS.homeLink}
          >
            Go to home
          </Link>
        </div>
      </div>
    </div>
  );
}