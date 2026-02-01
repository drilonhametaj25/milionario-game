import { useEffect } from 'react';
import { cn } from '../../lib/utils';

export default function Modal({
  isOpen,
  onClose,
  children,
  className = '',
  showClose = true,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          'relative glass rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto',
          'animate-slide-up',
          className
        )}
      >
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors touch-target"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ children, className = '' }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function ModalTitle({ children, className = '' }) {
  return (
    <h2 className={cn('text-2xl font-bold text-white', className)}>
      {children}
    </h2>
  );
}

export function ModalBody({ children, className = '' }) {
  return (
    <div className={cn('text-white/80', className)}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className = '' }) {
  return (
    <div className={cn('mt-6 flex gap-3 justify-end', className)}>
      {children}
    </div>
  );
}
