export const COLORS = {
  cream: '#EAE7DC',
  sand: '#D8C3A5',
  stone: '#8E8D8A',
  coral: '#E98074',
  red: '#E85A4F',
} as const;

export type ColorToken = keyof typeof COLORS;

export const RADII = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
} as const;

export type RadiusToken = keyof typeof RADII;

export const SPACING = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

export type SpacingToken = keyof typeof SPACING;

export const FONT_FAMILIES = {
  sans: 'Inter',
  serif: 'Fraunces',
} as const;

export type FontFamilyToken = keyof typeof FONT_FAMILIES;
