'use client';

import { InputHTMLAttributes, ReactNode } from 'react';
import { INPUTS, mergeClasses } from '@/styles';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
  compact?: boolean;
  hint?: string;
}

export default function Input({
  label,
  error,
  compact = false,
  hint,
  className,
  ...props
}: InputProps) {
  const inputClasses = mergeClasses(
    compact ? INPUTS.compact : INPUTS.base,
    error && 'border-red-500 focus:ring-red-400',
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label className={compact ? INPUTS.labelSm : INPUTS.label}>
          {label}
        </label>
      )}
      <input
        className={inputClasses}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
