'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from './cn';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium tracking-tight',
    'transition-colors duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E98074] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EAE7DC]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'rounded-full',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: 'bg-[#E98074] text-[#EAE7DC] hover:bg-[#E85A4F] border border-transparent',
        ghost:
          'bg-transparent text-[#8E8D8A] border border-[#8E8D8A]/40 hover:text-[#E98074] hover:border-[#E98074]/60',
        outline: 'bg-[#EAE7DC] text-[#E85A4F] border border-[#E98074] hover:bg-[#D8C3A5]/40',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-5 text-sm',
        lg: 'h-12 px-7 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

type MotionButtonProps = HTMLMotionProps<'button'>;

export interface ButtonProps
  extends Omit<MotionButtonProps, 'children'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        className: cn(classes, child.props.className),
        ...(props as Record<string, unknown>),
      });
    }

    return (
      <motion.button
        ref={ref}
        className={classes}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';

export { buttonVariants };
