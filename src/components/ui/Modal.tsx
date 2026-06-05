'use client';

import { ReactNode } from 'react';
import { MODALS, mergeClasses } from '@/styles';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  showCloseButton?: boolean;
  scrollable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  scrollable = false,
  size = 'md',
}: ModalProps) {
  if (!isOpen) return null;

  const containerClass = scrollable ? MODALS.scrollable : MODALS.container;

  return (
    <div className={MODALS.overlay}>
      <div className={containerClass}>
        {/* Header with close button */}
        {(title || showCloseButton) && (
          <div className={MODAL_LAYOUTS.modalHeader}>
            {title && <h2 className="text-xl font-bold text-gray-900">{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={TRANSITIONS.hover}
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
