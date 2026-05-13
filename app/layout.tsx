
import './globals.css';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { Providers } from '@/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Wordstowellness',
  description: 'Therapeutic letters and wellness platform',
  manifest: '/manifest.json',
  themeColor: '#667eea',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Words to Wellness',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}