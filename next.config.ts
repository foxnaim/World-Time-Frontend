import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const isProd = process.env.NODE_ENV === 'production';

// Backend origin for CSP's connect-src. Fall back to 'self' if the public
// API URL is unset (typical for dev where API is same-origin behind nginx).
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://telegram.org",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https://t.me https://*.telegram.org",
  "font-src 'self' https://fonts.gstatic.com",
  `connect-src 'self'${apiUrl ? ` ${apiUrl}` : ''}`,
  'frame-src https://oauth.telegram.org',
].join('; ');

// HSTS only in production. Dev is typically plain HTTP on localhost and
// emitting HSTS there poisons browser state across unrelated projects.
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)',
  },
  { key: 'Content-Security-Policy', value: csp },
  ...(isProd
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=15552000; includeSubDomains; preload',
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@worktime/ui', '@worktime/types'],
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 't.me',
      },
      {
        protocol: 'https',
        hostname: 'telegram.org',
      },
      {
        protocol: 'https',
        hostname: 'cdn.telegram.org',
      },
      {
        protocol: 'https',
        hostname: '**.telegram-cdn.org',
      },
      {
        protocol: 'https',
        hostname: '**.t.me',
      },
    ],
  },
  async headers() {
    return [
      {
        // Applies to every route. Nginx may also set a subset of these in
        // front of us; duplicates are harmless but keep the two layers in
        // sync when you tweak CSP.
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

const sentryEnabled = Boolean(process.env.SENTRY_DSN);

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      silent: !process.env.SENTRY_DSN,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      disableLogger: true,
    })
  : nextConfig;
