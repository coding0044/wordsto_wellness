'use client';

export default function DashboardShell({
  title,
  subtitle,
  children,
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <main className="container mx-auto px-4 py-8 lg:py-12">
        {children}
      </main>
    </div>
  );
}
