'use client';

import { ReactNode } from 'react';
import { getPlanColorClasses, mergeClasses } from '@/styles';

interface BadgeProps {
  label: string | ReactNode;
  plan?: 'Free' | 'Premium' | 'Pro';
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({
  label,
  plan = 'Free',
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  const colors = getPlanColorClasses(plan);
  
  const baseClasses = size === 'sm' 
    ? 'px-2 py-1 rounded text-xs font-medium'
    : 'px-3 py-1.5 rounded-full text-sm font-semibold';

  const variantClasses = variant === 'outline'
    ? `border ${colors.border} ${colors.text} bg-white`
    : `${colors.bg} ${colors.text}`;

  return (
    <span className={mergeClasses(baseClasses, variantClasses, className)}>
      {label}
    </span>
  );
}
