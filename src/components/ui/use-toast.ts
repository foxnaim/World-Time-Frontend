'use client';

import { useToastContext, type Toast, type ToastVariant } from './toast';

export type { Toast, ToastVariant };

/**
 * Minimal toast hook. Used within ToastProvider (see components/ui/toast.tsx).
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success('Saved');
 *   toast.error('Something went wrong', { description: '...' });
 */
export function useToast() {
  const { push, dismiss, toasts } = useToastContext();

  return {
    toast: (title: string, opts?: Partial<Omit<Toast, 'id' | 'title'>>) =>
      push({ title, ...opts }),
    success: (title: string, opts?: Partial<Omit<Toast, 'id' | 'title' | 'variant'>>) =>
      push({ title, variant: 'success', ...opts }),
    error: (title: string, opts?: Partial<Omit<Toast, 'id' | 'title' | 'variant'>>) =>
      push({ title, variant: 'error', ...opts }),
    dismiss,
    toasts,
  };
}
