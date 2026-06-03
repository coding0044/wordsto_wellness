
import './globals.css';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { Providers } from '@/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Wordstowellness',
  description: 'Therapeutic letters and wellness platform',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Words to Wellness',
  },
};

export const viewport = {
  themeColor: '#667eea',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">{children}</div>
            <footer className="border-t border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-600">
              💙 Words to Wellness - Helping you communicate with care and confidence
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
