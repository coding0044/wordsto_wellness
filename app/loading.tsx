import { PAGE_LAYOUTS, LOADERS } from '@/styles';

export default function Loading() {
  return (
    <div className={PAGE_LAYOUTS.fullScreenWithPadding}>
      <div className="text-center rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
        <div className={LOADERS.spinnerLarge}></div>
        <p className="text-base font-semibold text-slate-700">Loading…</p>
        <p className="mt-2 text-sm text-slate-500">Please wait while we load the page.</p>
      </div>
    </div>
  );
}
