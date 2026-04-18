'use client';

import * as React from 'react';
import { cn } from '@tact/ui';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  suffix?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
}

const SLIDER_STYLES = `
.wt-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 2px;
  background: rgba(142, 141, 138, 0.3);
  border-radius: 9999px;
  outline: none;
  cursor: pointer;
}
.wt-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background: #E98074;
  border: 2px solid #EAE7DC;
  box-shadow: 0 1px 3px rgba(142,141,138,0.3);
  cursor: grab;
  transition: transform 150ms ease-out, background-color 150ms ease-out;
}
.wt-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  background: #E85A4F;
}
.wt-slider::-webkit-slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.2);
}
.wt-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background: #E98074;
  border: 2px solid #EAE7DC;
  box-shadow: 0 1px 3px rgba(142,141,138,0.3);
  cursor: grab;
  transition: transform 150ms ease-out, background-color 150ms ease-out;
}
.wt-slider::-moz-range-thumb:hover {
  transform: scale(1.15);
  background: #E85A4F;
}
.wt-slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.wt-slider:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(233, 128, 116, 0.3);
}
`;

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  suffix,
  disabled = false,
  id,
  className,
  'aria-label': ariaLabel,
}) => {
  const reactId = React.useId();
  const fieldId = id ?? reactId;
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <style dangerouslySetInnerHTML={{ __html: SLIDER_STYLES }} />
      {(label || suffix) && (
        <div className="flex items-baseline justify-between">
          {label && (
            <label htmlFor={fieldId} className="text-[10px] uppercase tracking-[0.22em] text-stone">
              {label}
            </label>
          )}
          <span
            className="text-sm font-medium text-stone tabular-nums"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            {value}
            {suffix && (
              <span className="ml-1 text-[10px] uppercase tracking-[0.18em] text-stone/60">
                {suffix}
              </span>
            )}
          </span>
        </div>
      )}
      <input
        id={fieldId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel ?? label}
        className="wt-slider"
        style={{
          background: `linear-gradient(to right, #E98074 0%, #E98074 ${pct}%, rgba(142,141,138,0.3) ${pct}%, rgba(142,141,138,0.3) 100%)`,
        }}
      />
    </div>
  );
};

Slider.displayName = 'Slider';
