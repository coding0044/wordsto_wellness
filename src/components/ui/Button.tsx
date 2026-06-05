'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { BUTTONS, mergeClasses } from '@/styles';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'secondary':
        return fullWidth ? BUTTONS.secondaryLarge : BUTTONS.secondary;
      case 'danger':
        return BUTTONS.danger;
      case 'outline':
        return BUTTONS.outline;
      case 'primary':
      default:
        return fullWidth ? BUTTONS.primaryLarge : BUTTONS.primary;
    }
  };

  const baseClasses = mergeClasses(
    getVariantClasses(),
    fullWidth && 'w-full',
    (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
    className
  );

  return (
    <button
      className={baseClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
