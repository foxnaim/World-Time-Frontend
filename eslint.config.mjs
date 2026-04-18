import { FlatCompat } from '@eslint/eslintrc';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  { ignores: ['.next/**', 'node_modules/**', 'out/**', 'coverage/**', 'e2e/**', 'next-env.d.ts', 'cache-handler.mjs', 'sentry.*.config.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-object-type': 'off',
      'react/no-unescaped-entities': 'off',
      '@next/next/no-html-link-for-pages': 'error',
    },
  },
  prettierConfig,
];
