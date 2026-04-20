import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './cn';

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1.5',
    'px-2.5 py-0.5',
    'rounded-full',
    'text-[10px] font-medium uppercase tracking-[0.18em]',
    'border',
  ].join(' '),
  {
    variants: {
      variant: {
        neutral: 'bg-transparent text-[#8E8D8A] border-[#8E8D8A]/40',
        coral: 'bg-[#E98074]/15 text-[#E98074] border-[#E98074]/40',
        red: 'bg-[#E85A4F]/15 text-[#E85A4F] border-[#E85A4F]/40',
        sand: 'bg-[#D8C3A5]/40 text-[#8E8D8A] border-[#D8C3A5]',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />;
  },
);

Badge.displayName = 'Badge';

export { badgeVariants };
