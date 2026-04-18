'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@tact/ui';

export interface StepProgressProps {
  steps: string[];
  current: number; // 0-indexed
  className?: string;
  onStepClick?: (index: number) => void;
}

/**
 * Tick-based step indicator echoing the Dial aesthetic.
 * - Hairline row of ticks; major ticks at each step boundary.
 * - Labels beneath, uppercase small caps.
 */
export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  current,
  className,
  onStepClick,
}) => {
  const total = steps.length;
  const safeCurrent = Math.max(0, Math.min(total - 1, current));

  // minor ticks between majors
  const MINOR_PER_SEGMENT = 4;

  return (
    <div className={cn('w-full', className)}>
      <div className="relative flex items-center justify-between">
        {steps.map((_, i) => (
          <React.Fragment key={i}>
            {/* Major tick */}
            <button
              type="button"
              onClick={() => onStepClick?.(i)}
              disabled={!onStepClick}
              aria-current={i === safeCurrent ? 'step' : undefined}
              aria-label={`Шаг ${i + 1}: ${steps[i]}`}
              className={cn(
                'relative z-10 flex flex-col items-center gap-0',
                onStepClick ? 'cursor-pointer' : 'cursor-default',
              )}
            >
              <motion.span
                initial={false}
                animate={{
                  scale: i === safeCurrent ? 1.2 : 1,
                  backgroundColor: i <= safeCurrent ? '#E98074' : 'rgba(142,141,138,0.3)',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 24,
                }}
                className={cn('block h-3 w-[2px] rounded-sm', i === safeCurrent && 'h-4')}
              />
            </button>
            {/* Minor ticks + segment line */}
            {i < total - 1 && (
              <div className="flex-1 flex items-center justify-between mx-2">
                {Array.from({ length: MINOR_PER_SEGMENT }).map((_, j) => {
                  const segmentFrac = (j + 1) / (MINOR_PER_SEGMENT + 1);
                  const filled = i < safeCurrent || (i === safeCurrent && segmentFrac < 0.001);
                  // Progressive fill: if we're on segment i, highlight none; else full
                  return (
                    <span
                      key={j}
                      className={cn(
                        'block h-2 w-px rounded-sm',
                        filled ? 'bg-coral/70' : 'bg-stone/20',
                      )}
                    />
                  );
                })}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        {steps.map((label, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 text-center',
              i === 0 && 'text-left',
              i === total - 1 && 'text-right',
            )}
          >
            <span
              className={cn(
                'text-[10px] uppercase tracking-[0.22em]',
                i === safeCurrent ? 'text-coral' : i < safeCurrent ? 'text-stone' : 'text-stone/50',
              )}
            >
              <span className="tabular-nums">{String(i + 1).padStart(2, '0')}</span> / {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

StepProgress.displayName = 'StepProgress';
