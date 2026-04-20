'use client';

import * as React from 'react';

/**
 * Skip-to-content link for keyboard users.
 *
 * Visually hidden until it receives keyboard focus, then it becomes a
 * prominent coral-ringed pill anchored to the top-left of the viewport.
 * Points at `#main-content`, which is rendered in the root layout.
 */
export const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className={[
        // Visually hidden (clip 1px) when not focused
        'absolute left-2 top-2 z-[100]',
        '-translate-y-[200%] focus:translate-y-0',
        'transition-transform duration-150 ease-out',
        'rounded-md bg-cream px-4 py-2',
        'text-xs uppercase tracking-[0.24em] text-stone',
        'border border-coral/60 shadow-[0_8px_24px_rgba(142,141,138,0.2)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
        // Hide from screen readers visually but keep in tab order
        'focus:not-sr-only',
      ].join(' ')}
    >
      Перейти к содержимому
    </a>
  );
};

SkipLink.displayName = 'SkipLink';

export default SkipLink;
