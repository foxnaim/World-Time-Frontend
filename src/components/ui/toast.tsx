'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@worktime/ui';

export type ToastVariant = 'default' | 'success' | 'error';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToastContext(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider>');
  }
  return ctx;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const timers = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = React.useCallback(
    (t: Omit<Toast, 'id'>): string => {
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const toast: Toast = { id, variant: 'default', duration: 2000, ...t };
      setToasts((prev) => [...prev, toast]);
      const timer = setTimeout(() => dismiss(id), toast.duration ?? 2000);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  React.useEffect(() => {
    const snapshot = timers.current;
    return () => {
      snapshot.forEach((t) => clearTimeout(t));
      snapshot.clear();
    };
  }, []);

  const value = React.useMemo(
    () => ({ toasts, push, dismiss }),
    [toasts, push, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

const variantAccent: Record<ToastVariant, string> = {
  default: 'before:bg-stone',
  success: 'before:bg-coral',
  error: 'before:bg-red',
};

const ToastViewport: React.FC<{
  toasts: Toast[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="polite"
      role="region"
      className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 28,
              mass: 0.8,
            }}
            className={cn(
              'pointer-events-auto relative overflow-hidden',
              'min-w-[260px] max-w-sm',
              'bg-cream/95 backdrop-blur-sm',
              'border border-stone/30 rounded-lg',
              'px-4 py-3 pl-5',
              'shadow-[0_4px_24px_rgba(142,141,138,0.15)]',
              'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px]',
              variantAccent[t.variant ?? 'default'],
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium text-stone tracking-tight"
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  {t.title}
                </p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-stone/70">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(t.id)}
                className="text-stone/50 hover:text-stone transition-colors text-lg leading-none -mr-1 -mt-1 p-1"
                aria-label="Закрыть уведомление"
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
