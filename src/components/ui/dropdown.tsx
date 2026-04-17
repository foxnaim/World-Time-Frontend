'use client';

import * as React from 'react';
import { cn } from '@worktime/ui';

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
  menuClassName?: string;
}

/**
 * Lightweight dropdown using <details>/<summary> semantics with a
 * click-outside closer via useEffect. Accessible by default (native
 * disclosure widget behavior).
 */
export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'right',
  className,
  menuClassName,
}) => {
  const rootRef = React.useRef<HTMLDetailsElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.open) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        el.open = false;
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && rootRef.current?.open) {
        rootRef.current.open = false;
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, []);

  return (
    <details
      ref={rootRef}
      className={cn('relative inline-block group', className)}
    >
      <summary
        className="list-none cursor-pointer select-none outline-none [&::-webkit-details-marker]:hidden"
        aria-haspopup="menu"
      >
        {trigger}
      </summary>
      <div
        role="menu"
        className={cn(
          'absolute z-40 mt-2 min-w-[180px]',
          'bg-cream border border-stone/30 rounded-lg',
          'shadow-[0_8px_24px_rgba(142,141,138,0.18)]',
          'p-1.5',
          'animate-in fade-in-0 zoom-in-95',
          align === 'right' ? 'right-0' : 'left-0',
          menuClassName,
        )}
        onClick={(e) => {
          // auto-close when clicking an actionable item inside
          const tgt = e.target as HTMLElement;
          if (tgt.closest('[data-dropdown-item]') && rootRef.current) {
            rootRef.current.open = false;
          }
        }}
      >
        {children}
      </div>
    </details>
  );
};

export interface DropdownItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  danger?: boolean;
}

export const DropdownItem = React.forwardRef<
  HTMLButtonElement,
  DropdownItemProps
>(({ className, danger, children, ...props }, ref) => (
  <button
    ref={ref}
    role="menuitem"
    data-dropdown-item=""
    className={cn(
      'w-full text-left px-3 py-2 rounded-md text-sm',
      'transition-colors',
      danger
        ? 'text-red hover:bg-red/10'
        : 'text-stone hover:bg-stone/10 hover:text-coral',
      'focus:outline-none focus:bg-stone/10',
      className,
    )}
    {...props}
  >
    {children}
  </button>
));
DropdownItem.displayName = 'DropdownItem';

export const DropdownSeparator: React.FC<{ className?: string }> = ({
  className,
}) => <div className={cn('my-1 h-px bg-stone/20', className)} />;
