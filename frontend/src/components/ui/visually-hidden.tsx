'use client';

import * as React from 'react';

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: keyof React.JSX.IntrinsicElements;
  children: React.ReactNode;
}

/**
 * Renders content that is visible only to assistive technologies.
 *
 * Uses the standard clip-1px pattern so consumers don't have to rely on
 * Tailwind's `sr-only` utility (it may not be enabled in every build).
 */
export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  as: Tag = 'span',
  style,
  children,
  ...rest
}) => {
  const hiddenStyle: React.CSSProperties = {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
    ...style,
  };
  const Component = Tag as React.ElementType;
  return (
    <Component style={hiddenStyle} {...rest}>
      {children}
    </Component>
  );
};

VisuallyHidden.displayName = 'VisuallyHidden';

export default VisuallyHidden;
