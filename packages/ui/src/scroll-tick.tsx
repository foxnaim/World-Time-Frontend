import * as React from 'react';
import { COLORS } from './tokens';
import { cn } from './cn';

export interface ScrollTickProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  majorEvery?: number;
  height?: number;
  labels?: Array<{ at: number; text: string }>;
}

export const ScrollTick: React.FC<ScrollTickProps> = ({
  count = 48,
  majorEvery = 6,
  height = 48,
  labels,
  className,
  ...rest
}) => {
  const ticks = Array.from({ length: count }, (_, i) => i);

  return (
    <div className={cn('relative w-full overflow-hidden', className)} style={{ height }} {...rest}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${count * 10} ${height}`}
        preserveAspectRatio="none"
        className="block"
      >
        <line
          x1={0}
          y1={height - 1}
          x2={count * 10}
          y2={height - 1}
          stroke={COLORS.stone}
          strokeOpacity={0.3}
          strokeWidth={1}
        />
        {ticks.map((i) => {
          const x = i * 10 + 5;
          const isMajor = i % majorEvery === 0;
          const tickLen = isMajor ? 18 : 8;
          return (
            <line
              key={i}
              x1={x}
              y1={height - 1}
              x2={x}
              y2={height - 1 - tickLen}
              stroke={COLORS.stone}
              strokeOpacity={isMajor ? 0.6 : 0.25}
              strokeWidth={1}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      {labels && labels.length > 0 && (
        <div className="pointer-events-none absolute inset-0">
          {labels.map((l, idx) => (
            <span
              key={idx}
              className="absolute top-0 -translate-x-1/2 text-[10px] uppercase tracking-[0.22em] text-[#8E8D8A]"
              style={{ left: `${l.at * 100}%` }}
            >
              {l.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

ScrollTick.displayName = 'ScrollTick';
