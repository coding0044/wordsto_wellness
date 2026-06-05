'use client';
import Link from 'next/link';
import { CARD_LAYOUTS } from '@/styles';

export default function PageShell({
  title,
  subtitle,
  children,
  footerText,
  footerHref,
  footerAction,
  maxWidth = 'max-w-md',
}) {
  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className={`mx-auto ${maxWidth}`}>
        <div className={CARD_LAYOUTS.shellCard}>
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-400">wordstowellness</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">{title}</h1>
            {subtitle && <p className="mt-3 text-sm text-slate-200">{subtitle}</p>}
          </div>
          <div className="px-8 py-8">{children}</div>
          {(footerText && footerHref) || footerAction ? (
            <div className="bg-slate-50 px-8 py-5 text-center text-sm text-slate-600">
              {footerText && footerHref ? (
                <Link href={footerHref} className="font-medium text-sky-600 hover:text-sky-500">
                  {footerText}
                </Link>
              ) : null}
              {footerAction}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
