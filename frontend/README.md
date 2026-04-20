<div align="center">

# 🎨 Work Tact — Frontend

**Next.js 15 editorial UI for Work Tact — time tracking via Telegram and QR codes**

![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![SWR](https://img.shields.io/badge/SWR-2-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-2-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.48-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)

</div>

---

## About

<sub>PRODUCT NAME: WORK TACT · REPO: <code>World-Time-Frontend</code></sub>

Work Tact Frontend is the editorial face of Work Tact — a time-tracking platform where employees check in through Telegram or rotating office QR codes instead of desktop timers. The UI takes its cues from Swiss typography and editorial design references like [exteta.com/locus-solus](https://exteta.com/locus-solus): a restrained cream/sand palette, a variable-weight serif for display, and generous whitespace that lets the product breathe. Motion is small, purposeful, and always respectful of `prefers-reduced-motion`.

The centerpiece is the animated **Dial** component — a single SVG gauge that appears in three places: the marketing hero (as the product's signature mark), the office QR terminal (as a countdown to the next rotation), and the dashboard KPI cards (as progress indicators for hours, revenue, and utilization). The app ships Russian-first with an English fallback via cookie-based switching (no locale URL prefix), performs cryptographic JWT verification at the edge using `jose`, hydrates data with SWR, and installs as a PWA for office-terminal displays that need to survive flaky Wi-Fi and kiosk reboots.

## Features

- 🎨 **Editorial UI** — Swiss-style typography (Fraunces serif + Inter), cream/sand/stone/coral/red palette
- 🕐 **Dial Component** — SVG gauge reused across marketing hero, QR countdown, and KPI cards
- 🚀 **Next.js 15** — App Router, React Server Components, parallel routes, streaming responses
- 🔐 **Middleware Auth** — Cryptographic JWT verify via `jose` (edge runtime compatible)
- 🔄 **SSE Live Updates** — Real-time QR rotation on office display terminals
- 📱 **PWA Ready** — Manifest + service worker for offline-capable office displays
- 🌍 **i18n** — Russian + English cookie-based switching, no URL prefix
- 📊 **Dashboard Views** — B2B company overview, employees, reports, settings
- 💼 **Freelance Tracker** — B2C timer + projects + real hourly-rate insights
- 🧩 **Admin Panel** — Platform-level operations gated by super-admin guard
- 🎭 **Framer Motion** — Subtle reveals, stagger animations, reduced-motion aware
- 🌊 **Lenis Smooth Scroll** — Optional smooth scrolling with reduced-motion fallback
- ♿ **Accessible** — Skip link, focus rings, ARIA live regions, prefers-contrast support
- 🧪 **Well Tested** — Vitest unit + Playwright E2E across Chromium, Firefox, WebKit
- 🔒 **Security Headers** — CSP, HSTS, X-Frame-Options via `next.config` + middleware
- 📈 **Observability** — Sentry browser + server + edge instrumentation

## Tech Stack

**Core**

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 |
| Runtime | React 19 |
| Language | TypeScript 5.6 |
| Styling | Tailwind CSS 3.4 |
| Animations | Framer Motion 11 |

**Libraries**

| Category | Tool |
|----------|------|
| Data | SWR |
| Forms | Native + `CodeInput` primitive |
| Auth | `jose` (edge JWT verify) |
| QR | `qrcode` |
| Scroll | Lenis |
| Icons | Inline SVG + custom `Dial` |

**Tooling**

| Layer | Technology |
|-------|-----------|
| Unit Test | Vitest + Testing Library |
| E2E | Playwright |
| Lint | ESLint + Prettier |
| Errors | `@sentry/nextjs` |

## Routes

The App Router is organized into four route groups plus a standalone terminal route:

| Group | Path | Purpose |
|-------|------|---------|
| `(marketing)` | `/` | Landing with Dial hero, features, pricing |
| `(auth)` | `/login`, `/register`, `/onboarding/company` | Login + company onboarding wizard |
| `(dashboard)` | `/dashboard/company/[slug]/*`, `/dashboard/freelance/*` | B2B + B2C dashboards |
| `(admin)` | `/admin/*` | Super-admin panel |
| `office` | `/office/[companyId]/qr` | Rotating QR display for office terminals |

## Design System

**Palette** (Tailwind tokens)

| Token | Hex | Usage |
|-------|-----|-------|
| `cream` | `#EAE7DC` | Base background |
| `sand` | `#D8C3A5` | Secondary surface |
| `stone` | `#8E8D8A` | Body text |
| `coral` | `#E98074` | Accents, CTAs |
| `red` | `#E85A4F` | Alerts, emphasis |

**Fonts**

- **Fraunces** — serif, variable optical size, for display headings
- **Inter** — sans, for UI and body

**Shared components** from `@tact/ui`: `Button`, `Card`, `Badge`, `Dial`, `Input`, `ScrollTick`.

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (marketing)/             # Landing + components
│   │   ├── (auth)/                  # Login, register, onboarding
│   │   ├── (dashboard)/             # B2B company, B2C freelance
│   │   ├── (admin)/                 # Super-admin pages
│   │   ├── office/[companyId]/qr/   # Rotating QR terminal
│   │   ├── api/                     # Route handlers (proxy, health)
│   │   ├── layout.tsx               # Root: fonts, metadata, skip-link
│   │   ├── globals.css
│   │   ├── sitemap.ts + robots.ts + opengraph-image.tsx
│   │   └── manifest.ts
│   ├── components/
│   │   ├── landing/
│   │   ├── dashboard/
│   │   ├── office/
│   │   ├── admin/
│   │   ├── shared/
│   │   └── ui/                      # Primitives (code-input, modal, toast, slider, etc.)
│   ├── lib/                         # api, fetcher, jwt-verify, auth-cookie, cn, env
│   ├── hooks/
│   ├── i18n/                        # ru.json, en.json, translator
│   └── middleware.ts                # JWT verify + refresh + protected routes
├── public/                          # Manifest, SW, icons, logo
├── e2e/                             # Playwright specs + fixtures
├── sentry.*.config.ts
├── next.config.ts                   # Sentry wrap + headers + standalone output
├── tailwind.config.ts
└── Dockerfile
```

## Getting Started

```sh
git clone https://github.com/foxnaim/World-Time-Frontend.git
cd World-Time-Frontend
pnpm install
cp .env.local.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** this package depends on `@tact/ui`, `@tact/types`, and `@tact/config` via `workspace:*`. To run standalone, either clone the full monorepo or inline those packages locally.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Base URL of the Work Tact back-end API |
| `NEXT_PUBLIC_APP_URL` | Canonical URL of this frontend (used for metadata, OG, sitemap) |
| `NEXT_PUBLIC_BOT_USERNAME` | Telegram bot username (without `@`) for the Login Widget |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for browser + edge error reporting |
| `JWT_PUBLIC_SECRET` | Public key / shared secret consumed by `jose` in middleware |
| `NEXT_PUBLIC_DISPLAY_KEY` | Shared key used by office-terminal SSE to authenticate QR rotation |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Default UI locale, `ru` or `en` |
| `NEXT_TELEMETRY_DISABLED` | Set to `1` to opt out of Next.js telemetry |

## Testing

```sh
pnpm test                     # Vitest unit
pnpm test:watch
pnpm test:coverage
pnpm test:e2e:install         # one-time Playwright browser install
pnpm test:e2e                 # Playwright E2E
pnpm test:e2e:ui              # interactive Playwright UI
```

Unit tests live next to the code under test (`*.test.ts`, `*.test.tsx`). Playwright specs are under `e2e/` and exercise marketing, auth, and dashboard flows across Chromium, Firefox, and WebKit.

## Docker

```sh
docker build -f Dockerfile -t tact-frontend ..
# or use the monorepo docker compose
```

The build context is the monorepo root so that workspace packages can be resolved. The image uses Next.js `output: 'standalone'` for a minimal runtime footprint.

## Deployment

- **Vercel** — push this repo, set env vars; `output: 'standalone'` remains compatible
- **Fly.io / Railway / Render** — use the included `Dockerfile`
- **Self-hosted** — `docker-compose.prod.yml` + nginx in the monorepo

## Links

- Backend: [World-Time-back-End](https://github.com/foxnaim/World-Time-back-End)
- Design reference: [exteta.com/locus-solus](https://exteta.com/locus-solus)

## License

MIT © [foxnaim](https://github.com/foxnaim)
