import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#EAE7DC',
        sand: '#D8C3A5',
        stone: '#8E8D8A',
        coral: '#E98074',
        red: '#E85A4F',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },
      letterSpacing: {
        'editorial': '-0.02em',
        'editorial-wide': '0.06em',
      },
      fontSize: {
        'display': ['clamp(3rem, 8vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'hero': ['clamp(2.25rem, 5vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.025em' }],
      },
      borderColor: {
        DEFAULT: 'rgba(142, 141, 138, 0.4)',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.hairline': {
          'border-width': '1px',
          'border-color': 'rgba(142, 141, 138, 0.4)',
          'border-style': 'solid',
        },
        '.hairline-t': {
          'border-top-width': '1px',
          'border-top-color': 'rgba(142, 141, 138, 0.4)',
          'border-top-style': 'solid',
        },
        '.hairline-b': {
          'border-bottom-width': '1px',
          'border-bottom-color': 'rgba(142, 141, 138, 0.4)',
          'border-bottom-style': 'solid',
        },
        '.hairline-l': {
          'border-left-width': '1px',
          'border-left-color': 'rgba(142, 141, 138, 0.4)',
          'border-left-style': 'solid',
        },
        '.hairline-r': {
          'border-right-width': '1px',
          'border-right-color': 'rgba(142, 141, 138, 0.4)',
          'border-right-style': 'solid',
        },
        '.hairline-x': {
          'border-left-width': '1px',
          'border-right-width': '1px',
          'border-color': 'rgba(142, 141, 138, 0.4)',
          'border-style': 'solid',
        },
        '.hairline-y': {
          'border-top-width': '1px',
          'border-bottom-width': '1px',
          'border-color': 'rgba(142, 141, 138, 0.4)',
          'border-style': 'solid',
        },
      });
    }),
  ],
};

export default config;
