'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@tact/ui';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  'aria-label'?: string;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  className,
  closeOnBackdrop = true,
  closeOnEscape = true,
  'aria-label': ariaLabel,
}) => {
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);
  const titleId = React.useId();
  const descId = React.useId();

  // Escape key
  React.useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeOnEscape, onClose]);

  // Lock body scroll while open
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Capture previously-focused element and move focus to the modal on open.
  // Restore focus on close.
  React.useEffect(() => {
    if (!open) return;
    previousFocusRef.current =
      typeof document !== 'undefined'
        ? (document.activeElement as HTMLElement | null)
        : null;

    // Defer focus until after motion mounts the card.
    const id = window.setTimeout(() => {
      const card = cardRef.current;
      if (!card) return;
      const focusables = card.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const first = focusables[0];
      if (first) {
        first.focus();
      } else {
        card.setAttribute('tabindex', '-1');
        card.focus();
      }
    }, 10);

    return () => {
      window.clearTimeout(id);
      // Restore focus to where it was before the modal opened.
      const prev = previousFocusRef.current;
      if (prev && typeof prev.focus === 'function') {
        // Next tick so AnimatePresence exit doesn't steal focus first.
        window.setTimeout(() => {
          try {
            prev.focus();
          } catch {
            /* element may have unmounted */
          }
        }, 0);
      }
    };
  }, [open]);

  // Focus trap — keep Tab/Shift+Tab inside the card while open.
  React.useEffect(() => {
    if (!open) return;
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const card = cardRef.current;
      if (!card) return;
      const focusables = Array.from(
        card.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(
        (el) =>
          !el.hasAttribute('disabled') &&
          el.getAttribute('aria-hidden') !== 'true',
      );
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !card.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleTab);
    return () => window.removeEventListener('keydown', handleTab);
  }, [open]);

  const hasTitle = title != null;
  const hasDesc = description != null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-root"
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={
            !hasTitle
              ? (ariaLabel ?? undefined)
              : typeof title !== 'string'
                ? ariaLabel
                : undefined
          }
          aria-labelledby={hasTitle ? titleId : undefined}
          aria-describedby={hasDesc ? descId : undefined}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-stone/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              if (closeOnBackdrop) onClose();
            }}
            aria-hidden="true"
          />
          {/* Card */}
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{
              type: 'spring',
              stiffness: 320,
              damping: 28,
              mass: 0.8,
            }}
            className={cn(
              'relative z-10 w-full max-w-md',
              'bg-cream rounded-2xl',
              'border border-stone/30',
              'shadow-[0_20px_60px_rgba(142,141,138,0.25)]',
              'p-6 md:p-8',
              className,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {(hasTitle || hasDesc) && (
              <header className="mb-5">
                {hasTitle && (
                  <h2
                    id={titleId}
                    className="text-2xl font-medium tracking-tight text-stone"
                    style={{ fontFamily: 'Fraunces, serif' }}
                  >
                    {title}
                  </h2>
                )}
                {hasDesc && (
                  <p id={descId} className="mt-1.5 text-sm text-stone/70">
                    {description}
                  </p>
                )}
              </header>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full text-stone/60 hover:text-stone hover:bg-stone/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors"
            >
              <span className="text-xl leading-none" aria-hidden="true">
                ×
              </span>
            </button>
            <div className="text-stone">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

Modal.displayName = 'Modal';
