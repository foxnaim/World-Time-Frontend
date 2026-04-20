import * as React from 'react';
import { cn } from './cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[10px] uppercase tracking-[0.22em] text-[#8E8D8A]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'h-10 w-full',
            'bg-transparent',
            'border-0 border-b border-[#8E8D8A]/40',
            'px-0 py-2',
            'text-[#8E8D8A] placeholder:text-[#8E8D8A]/50',
            'focus:outline-none focus:border-[#E98074]',
            'focus:ring-0',
            'transition-colors duration-200',
            'rounded-none',
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = 'Input';
