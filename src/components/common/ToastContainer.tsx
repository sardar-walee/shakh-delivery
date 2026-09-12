import React from 'react';
import { AnimatePresence } from 'motion/react';
import { useToastStore } from '../../store/useToastStore';
import ToastItem from './ToastItem';

export default function ToastContainer() {
  const { toasts, position } = useToastStore();

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 sm:top-20 left-4 items-start';
      case 'top-center':
        return 'top-4 sm:top-20 left-1/2 -translate-x-1/2 items-center';
      case 'top-right':
        return 'top-4 sm:top-20 right-4 items-end';
      case 'bottom-left':
        return 'bottom-20 md:bottom-6 left-4 items-start';
      case 'bottom-center':
        return 'bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 items-center';
      case 'bottom-right':
      default:
        // Respect RTL/LTR: In bottom-right, in LTR it sticks to right; in RTL it sticks to bottom-right or end
        return 'bottom-20 md:bottom-6 right-4 rtl:right-auto rtl:left-4 items-end rtl:items-start';
    }
  };

  return (
    <div
      aria-live="polite"
      className={`fixed z-[9999] pointer-events-none flex flex-col gap-2.5 max-w-[calc(100vw-2rem)] sm:max-w-md ${getPositionClasses()}`}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
