export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 flex items-center justify-center px-6 py-12">
      <div className="text-center rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
        <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500"></div>
        <p className="text-base font-semibold text-slate-700">Loading…</p>
        <p className="mt-2 text-sm text-slate-500">Please wait while we load the page.</p>
      </div>
    </div>
  );
}
