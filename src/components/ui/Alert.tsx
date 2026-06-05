'use client';

import { ReactNode } from 'react';
import { ALERTS, mergeClasses } from '@/styles';

type AlertType = 'success' | 'error' | 'info';

interface AlertProps {
  message: string | ReactNode;
  type?: AlertType;
  showIcon?: boolean;
  className?: string;
}

const getAlertClasses = (type: AlertType): string => {
  switch (type) {
    case 'success':
      return mergeClasses(ALERTS.successBorder, ALERTS.successBg);
    case 'error':
      return mergeClasses(ALERTS.errorBorder, ALERTS.errorBg);
    case 'info':
      return mergeClasses(ALERTS.infoBg, 'rounded-lg border border-blue-200');
    default:
      return mergeClasses(ALERTS.errorBorder, ALERTS.errorBg);
  }
};

const getIcon = (type: AlertType) => {
  switch (type) {
    case 'success':
      return (
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    case 'error':
      return (
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    case 'info':
      return (
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
  }
};

export default function Alert({
  message,
  type = 'error',
  showIcon = true,
  className,
}: AlertProps) {
  if (!message) return null;

  return (
    <div className={mergeClasses(ALERTS.base, getAlertClasses(type), className)}>
      {showIcon && getIcon(type)}
      <span>{message}</span>
    </div>
  );
}
