import * as React from 'react';
import { cn } from './cn';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  eyebrow?: React.ReactNode;
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, eyebrow, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border border-[#8E8D8A]/20 bg-[#EAE7DC]/60 backdrop-blur-sm',
          'p-6 md:p-8',
          'shadow-[0_1px_0_rgba(142,141,138,0.08)]',
          className,
        )}
        {...props}
      >
        {(eyebrow || title) && (
          <header className="mb-5 flex flex-col gap-1.5">
            {eyebrow && (
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#8E8D8A]">
                {eyebrow}
              </span>
            )}
            {title && (
              <h3 className="text-xl md:text-2xl font-medium tracking-tight text-[#8E8D8A]">
                {title}
              </h3>
            )}
          </header>
        )}
        <div className="text-[#8E8D8A]">{children}</div>
      </div>
    );
  },
);

Card.displayName = 'Card';
