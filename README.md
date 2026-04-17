# World-Time-Frontend

Next.js 15 frontend for WorkTime — editorial/swiss-style time tracking UI.

## Stack

- Next.js 15 (App Router, RSC) + React 19 + TypeScript
- Tailwind CSS 3 + custom palette (cream `#EAE7DC`, sand `#D8C3A5`, stone `#8E8D8A`, coral `#E98074`, red `#E85A4F`)
- Fonts: Fraunces (serif display) + Inter (sans UI)
- Framer Motion + Lenis smooth scroll
- SWR for data, `jose` for middleware JWT verify
- Vitest + Playwright
- Sentry, PWA manifest + service worker

## Routes

- `(marketing)` — landing with animated Dial hero
- `(auth)` — Telegram 6-digit code login + Widget
- `(dashboard)` — B2B company overview, employees, reports, settings; B2C freelance timer + projects + insights
- `office/[companyId]/qr` — rotating QR display for office terminals
- `(admin)` — platform super-admin panel

## Run (local)

```sh
pnpm install
cp ../.env.example .env.local
pnpm dev
```

> **Note:** this package depends on `@worktime/ui`, `@worktime/types`, `@worktime/config` via `workspace:*`. To run standalone, either clone the full monorepo or inline those packages locally.

## Docker

```sh
docker build -f Dockerfile -t worktime-frontend ..
```

(Build context is the monorepo root.)
