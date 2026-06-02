'use client';
import Link from 'next/link';

export default function BrandLogo({ size = 'default', href = '/dashboard' }) {
  const sizeClasses = {
    small: 'w-5 h-5',
    default: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  const textClasses = {
    small: 'text-lg',
    default: 'text-xl',
    large: 'text-2xl',
  };

  return (
    <Link href={href} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center shadow-sm`}>
        <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span className={`${textClasses[size]} font-light bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text text-transparent`}>
          Words
        </span>
        <span className={`${textClasses[size]} font-light bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent -mt-1`}>
          to Wellness
        </span>
      </div>
    </Link>
  );
}
