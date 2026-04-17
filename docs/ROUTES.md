# Routes

App Router structure. Route groups (`(name)`) don't affect URL; they share layouts and scope code. Four top-level groups (`(marketing)`, `(auth)`, `(dashboard)`, `(admin)`) plus the standalone `office/` tree and Next.js metadata files.

## Overview Table

| URL | Group | Auth | Render | Source |
|-----|-------|------|--------|--------|
| `/` | marketing | public | RSC + client islands | static + `@/components/landing/*` |
| `/login` | auth | public | client | Telegram one-time code + widget |
| `/register` | auth | public | client | reuses `LoginView` |
| `/onboarding/company` | auth | authed (`AuthGuard`) | client | 4-step wizard → `POST /companies` |
| `/company/[slug]` | dashboard | authed (middleware) | client | SWR: company + analytics |
| `/company/[slug]/employees` | dashboard | authed (middleware) | client | SWR + `InviteModal` |
| `/company/[slug]/reports` | dashboard | authed (middleware) | client | SWR + export mutation |
| `/company/[slug]/qr` | dashboard | authed (middleware) | client | SWR + iframe into `/office/*` |
| `/company/[slug]/settings` | dashboard | authed (middleware) | client | SWR + PATCH `/companies/:slug` |
| `/freelance` | dashboard | authed (middleware) | client | SWR: projects + real-rate |
| `/freelance/projects` | dashboard | authed (middleware) | client | SWR: `/api/projects` |
| `/freelance/projects/[id]` | dashboard | authed (middleware) | client | SWR + `ProjectForm` mutation |
| `/freelance/projects/new` | dashboard | authed (middleware) | client | `ProjectForm` (create) |
| `/freelance/stats` | dashboard | authed (middleware) | client | SWR: 6-month batch fetch |
| `/admin` | admin | super-admin (403 gate) | client | SWR `/admin/stats` |
| `/admin/companies` | admin | super-admin (403 gate) | client | SWR `/admin/companies` (cursor) |
| `/admin/companies/[id]` | admin | super-admin (403 gate) | client | SWR + delete mutation |
| `/office/[companyId]/qr` | standalone | `X-Display-Key` / `?key=` | RSC shell + client display | SSE + polling fallback |

Notes:
- The `(dashboard)` group's routes are mounted at `/company/*` and `/freelance/*` — there is **no** literal `/dashboard` URL prefix. The Edge middleware, however, protects `/dashboard` and `/admin` (see "Middleware / Known Discrepancy" below).
- All dashboard pages declare `'use client'` and fetch via SWR; there is currently no RSC-backed data fetch outside marketing.
- The `api/` directory exists but is empty — the frontend talks to an external backend through `@/lib/api` + `@/lib/fetcher`. Paths beginning with `/api/` in SWR keys are proxied by the fetcher to `NEXT_PUBLIC_API_URL` (see `@/lib/fetcher`).

---

## Marketing — `/app/(marketing)/`

### `/` (`page.tsx`)
Server component. Composes a stack of client-island sections imported from `@/components/landing/*`:

1. `<Header />` — client (EN/RU toggle, scroll state, mobile menu).
2. `<Hero />` — client (framer-motion Dial animation).
3. `<Segments />` — RSC.
4. `<HowItWorks />` — RSC with CSS scroll-snap.
5. `<Features />` — RSC + `Reveal` islands (IntersectionObserver).
6. `<Pricing />` — RSC.
7. `<Cta />` — RSC.
8. `<Footer />` — RSC.

### Metadata
- `alternates.canonical: '/'`.
- Page-level `title` / `description` override layout defaults.
- Layout (`(marketing)/layout.tsx`) only sets `<>{children}</>` plus `metadata` + `viewport` (themeColor `#EAE7DC`) — no chrome, the page owns its `<main>`.

### Styling
- Cream background (`bg-cream`), stone text (`text-stone`), Fraunces + Inter.
- Style tokens come from `@worktime/ui` COLORS + Tailwind.
- Reveal animation via IntersectionObserver inside the `Reveal` island.

---

## Auth — `/app/(auth)/`

The shared `layout.tsx` renders a full-bleed cream canvas with a decorative concentric-rings SVG (10 circles, 48 cardinal ticks) behind the content, a top-left wordmark linking home, and a centered `<main>` that vertically centers the card.

### `/login` (`login/page.tsx`)
- `'use client'`. Exports a default `LoginPage` and a reusable `LoginView` consumed by `/register`.
- **Flow**: user opens `@worktime_bot` → `/auth` → copies a 6-digit code → pastes into the `CodeInput`.
- **Mutation**: `api.post('/auth/telegram/bot-login', { oneTimeCode })` → on success calls `setAuthCookies({ accessToken, refreshToken, expiresIn })` and `router.push(next)` (default `/dashboard`; overridable via `?next=...` or prop).
- **Alternate**: Telegram Login Widget inside a `Modal` → `api.post('/auth/telegram/verify', { initData })`.
- Auto-submits when the 6-digit code is complete; shows inline + toast errors.

### `/register` (`register/page.tsx`)
- `'use client'`. Thin wrapper around `<LoginView />` with copy tuned for registration and `redirectTo="/onboarding/company"`. No separate form.

### `/onboarding/company` (`onboarding/company/page.tsx`)
- `'use client'`. Wrapped in `<AuthGuard />` which reads `/auth/me` via SWR (middleware already guarantees a valid session by the time this renders).
- 4-step wizard driven by local state + `<StepProgress />`:
  1. **Компания** — name + slug (auto-slugified from Cyrillic, editable once touched).
  2. **Адрес** — address + lat/lng + geofence radius slider (25–1000 m).
  3. **График** — work start/end times + timezone select (7 Kazakhstan/RU + UTC).
  4. **Проверка** — review `<dl>`.
- **Mutation**: `api.post('/companies', { name, slug, address, location, geofenceRadius, workHours, timezone })` → `router.push('/dashboard/company/' + slug)` (note: destination `/dashboard/...` does not map to an actual page; see Known Discrepancy).
- Framer-motion slide transitions between steps.

---

## Dashboard — `/app/(dashboard)/`

### Layout (`layout.tsx`)
- `'use client'`. 240 px left sidebar + sticky top bar + `<main>` content area.
- **Sidebar**: two navigation groups — "Компания" (Обзор / Сотрудники / Отчёты / QR / Настройки) and "Фриланс" (Таймер / Проекты / Статистика).
- **Top bar**: `CompanySwitcher` (dropdown sourced from SWR `/api/companies/my`), `MonthBadge` (last 6 months; writes `?month=YYYY-MM` via `history.replaceState`), `UserMenu` (profile / logout stub — hard-coded email `info@aoneagency.kz`).
- Active state derived from `usePathname()`; freelance routes hide the `CompanySwitcher` and `MonthBadge`.

### `/company/[slug]` — overview
- Four SWR subscriptions, gated on resolved company `id`:
  - `/api/companies/:slug` → `CompanyDetail`.
  - `/api/analytics/company/:id/summary?month=` → KPI aggregates + prev-period delta.
  - `/api/analytics/company/:id/ranking?month=` → top-5 punctuality.
  - `/api/analytics/company/:id/late-stats?month=` → recent late entries.
- Each block has its own skeleton + `ErrorState` with `onRetry={mutate}`.
- KPIs: employee count, avg late minutes (`invertSemantic`), overtime hours, punctuality score.

### `/company/[slug]/employees`
- SWR `/api/companies/:slug` then `/api/companies/:id/employees` → `EmployeesTable`.
- Local `query` filters by name / position client-side.
- `InviteModal` POSTs invite tokens (implementation in `@/components/dashboard/company/invite-modal`).

### `/company/[slug]/reports`
- Tabbed (`late` / `overtime` / `payouts`) with `MonthPicker`.
- SWR keys parameterised on `month` + active tab; `api.post('/api/.../export', ...)` produces a downloadable URL.

### `/company/[slug]/qr`
- SWR `/api/companies/:slug` to resolve `id`, then embeds `<iframe src="/office/:id/qr">` as a 400×400 preview.
- Static copy with 4 onboarding steps; button opens the office page in a new tab.
- No SSE here — the iframe loads the standalone office route which owns its own stream.

### `/company/[slug]/settings`
- SWR `/api/companies/:slug` → mirrors response into local `form` state once.
- PATCH mutation (via `api` in `@/lib/api`) then `mutate()` to revalidate.
- Fields: name, address, lat/lng, geofence radius, work start/end hours (via `hourToTimeStr`), timezone (7 options). Only owners reach this page (backend enforces).

### `/freelance` — overview
- SWR `/api/projects` + `/api/analytics/user/real-hourly-rate?month=YYYY-MM`.
- Renders `<Timer />` (client — starts/stops entries), three KPI tiles (month hours, active project count, effective hourly rate), project card grid, `<InsightCard />`.

### `/freelance/projects`
- SWR `/api/projects`. Renders a sortable table of projects with status badge + "Новый проект" CTA linking to `/freelance/projects/new`.

### `/freelance/projects/[id]`
- SWR `/api/projects/:id`, `/api/time-entries?projectId=...&from=...&to=...`, `/api/analytics/project/:id/monthly-summary?month=`.
- Embeds `<ProjectForm mode="edit" />` for in-place updates and `<InsightCard />` for the monthly insight.
- Status badges (`ACTIVE` / `DONE` / `ARCHIVED`) localised via `STATUS_LABEL`.

### `/freelance/projects/new`
- `'use client'`. Just a header + `<ProjectForm mode="create" />`. All form logic, validation, and `POST /api/projects` mutation live in the shared component.

### `/freelance/stats`
- Batches SWR calls for the last 6 months by rendering fixed `<MonthRateFetcher />` + `<ProjectMonthFetcher />` children (each runs exactly one `useSWR`, so hook order stays stable).
- Aggregates into a 6-month sparkline + per-project breakdown.

---

## Admin — `/app/(admin)/`

### Layout (`layout.tsx`)
- `'use client'`. Uses SWR `/admin/stats` as the 403 probe — if the endpoint returns `ApiError` with status 403, renders `<NoAccess />` (stone-toned 403 with hint about `SUPER_ADMIN_TELEGRAM_IDS`) instead of the chrome.
- Other error / missing-data also shows `<NoAccess />`; Edge middleware still has to pass the user through first.
- Chrome: stone-grey sidebar (WorkTime / admin wordmark, 3-item nav: Обзор / Компании / Пользователи), sticky top bar with "super-admin" eyebrow.
- Note: the sidebar links to `/admin/users`, but no `users/page.tsx` exists yet — clicking it produces a 404.

### `/admin`
- SWR `/admin/stats` → 6 `<StatTile />` cards (users, companies, employees, active employees, check-ins today, active projects). Manual refresh only (`revalidateOnFocus: false`).

### `/admin/companies`
- SWR key `['/admin/companies', { limit, cursor, q }]` → cursor-paginated 25-per-page table with debounced search (300 ms).
- Back/forward navigation maintained via a `stack` of previous cursors.
- Each row links to `/admin/companies/:id`.

### `/admin/companies/[id]`
- SWR `/admin/companies/:id` → owner + counts (employees / qrTokens / inviteTokens) + full employee list with role + status.
- Destructive action: `api.delete('/admin/companies/:id')` gated by `<ConfirmModal />`; on success `useSWRConfig().mutate('/admin/companies')` + `router.push('/admin/companies')`.

---

## Office — `/app/office/[companyId]/qr/`

Standalone tree — **not inside a route group**, so its layout does not inherit the dashboard chrome. Intentionally fullscreen for permanent-mount tablets.

### Layout (`layout.tsx`)
- Server component. `metadata.robots = { index: false, follow: false }`.
- `viewport.userScalable = false`, `maximumScale: 1` — pinch-zoom blocked.
- Wraps children in `<div class="fixed inset-0 overflow-hidden bg-cream" style={{ height: '100vh', width: '100vw' }}>`.
- Renders `<RegisterSw />` (registers `/sw.js` on mount, office devices only).

### `/office/[companyId]/qr` (`page.tsx`)
- RSC shell. Reads `companyId` via `await params` and passes it to `<QrDisplay companyId={companyId} />` (client).
- `export const dynamic = 'force-dynamic'` — never prerender (the component relies on a live display key).
- `<QrDisplay />` subscribes via `EventSource` (SSE) to the backend. Since `EventSource` can't attach headers, the display key is passed as `?key=` when `NEXT_PUBLIC_DISPLAY_KEY` is seeded in the tablet's env, or via `X-Display-Key` for non-SSE fallbacks.
- Exempt from the Edge middleware (see Matcher below) — the office terminal has its own device-pairing auth.

---

## Middleware — `/frontend/src/middleware.ts`

Edge runtime. Runs on every request matched by the matcher below.

### Protected prefixes
`/dashboard`, `/admin` (plus `/dashboard/*`, `/admin/*`). Everything else is passed through with security headers only.

### Flow on protected paths
1. Read `wt_access` cookie → verify via `jose` HS256 using `JWT_PUBLIC_SECRET` (shared with backend `JWT_SECRET`).
2. On success → `NextResponse.next()` with security headers.
3. On failure → `tryRefresh(req)`:
   - POST `/api/auth/refresh` forwarding the `wt_refresh` cookie, `cache: 'no-store'`, `redirect: 'manual'`.
   - Collects `Set-Cookie` via `getSetCookie()` (modern runtime) or `get('set-cookie')` fallback.
   - Accepts either JSON body (`{ accessToken, expiresIn? }`) or pure `Set-Cookie`.
4. On refresh success → verify new `accessToken` (or trust backend `Set-Cookie` if no body), then `applyRefreshCookies(res, refreshed)` + pass through.
5. On refresh failure → `redirect('/login?next=<original+search>')`.

### Security headers (on every middleware response)
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

Broader CSP / HSTS / Permissions-Policy live in `next.config.ts`.

### Matcher
```
/((?!api|_next/static|_next/image|office|favicon.ico|logo.svg|robots.txt|sitemap.xml).*)
```
Excludes: `/api`, `/_next/static`, `/_next/image`, `/office`, favicon, logo, robots, sitemap.

### Known discrepancy
The middleware protects `/dashboard` + `/admin` prefixes, but the `(dashboard)` group renders pages at `/company/*` and `/freelance/*` (no `/dashboard` prefix). As a result:
- A direct hit to `/company/foo` is **not** blocked by middleware — the page relies on the backend API (`401`/`403` on the SWR call) to fail closed.
- `/admin` is consistent — matched by both middleware and the route group.
- The login `next` default of `/dashboard` and the onboarding redirect to `/dashboard/company/:slug` currently land on a 404. Either the routes should be remounted under `/dashboard/*` or the post-auth redirects should be updated to `/company/:slug` + `/freelance`.

---

## Error Handling

- `/app/error.tsx` — client error boundary (`'use client'`). Logs to console, shows Fraunces heading "Что-то пошло не так.", optional `error.digest` ref, Retry (calls `reset()`) + "На главную" link.
- `/app/not-found.tsx` — editorial 404: large display `404`, heading "Этой страницы здесь нет.", buttons link to `/` and `/features` (note: `/features` is not a route — it's an anchor on the landing page).
- `/app/loading.tsx` — minimal SVG dial spinner (48 × 48, coral hand, tick ring, center pin). `role="status"`, `aria-label="Загрузка"`, `sr-only` text.
- Office and admin routes render their own in-tree loading / error states rather than relying on the route-level boundary.

---

## Metadata & SEO

### Root (`/app/layout.tsx`)
- `metadataBase` from `NEXT_PUBLIC_APP_URL` (fallback `http://localhost:3000`).
- `title.template: '%s — WorkTime'`, default "WorkTime — учёт рабочего времени".
- Full `openGraph` (website, `ru_RU`), `twitter` (`summary_large_image`), 6 Russian keywords.
- `icons.icon: '/logo.svg'`, `manifest: '/manifest.webmanifest'`.
- `viewport.themeColor: '#E85A4F'`, `colorScheme: 'light'`, width + initialScale.
- Loads Inter (400/500/600 latin + cyrillic) and Fraunces (400/500/600 + `opsz` axis) via `next/font/google`; CSS variables `--font-inter` / `--font-fraunces`.
- Renders `<SkipLink />` and wraps children in `<div id="main-content" tabIndex={-1}>` — each nested layout declares its own `<main>` landmark to avoid duplication.

### Route-level
- `(marketing)/layout.tsx`: OG/Twitter overrides (`'QR-сканер, геозоны, отчёты'` copy).
- `(marketing)/page.tsx`: `title`, `description`, `alternates.canonical: '/'`.
- `office/[companyId]/qr/layout.tsx`: `robots: { index: false, follow: false }`, `userScalable: false`.
- `not-found.tsx`: `title: 'Страница не найдена — 404'`.

### File-route metadata
- `sitemap.ts` — exports `/`, `/login`, `/register` with lastModified=now, weekly/monthly change frequencies.
- `robots.ts` — `allow: '/'`, disallow `/api/`, `/dashboard/`, `/admin/`, `/office/`, `/auth/`; references `${APP_URL}/sitemap.xml`.
- `opengraph-image.tsx` — Edge runtime, 1200×630 PNG via `next/og` `ImageResponse`. Fetches Fraunces 600 weight from Google Fonts, renders a coral dial with offset hand + centered title + tick ruler on cream.
- `twitter-image.tsx` — same size / same coral-dial composition (mirrors OG image).
- `icon.tsx` — Edge 32×32 "W" on coral dial, cream background.
- `apple-icon.tsx` — (sibling) 180×180 icon used by `manifest.ts`.

---

## PWA

### `manifest.ts` (`/manifest.webmanifest`)
- `name: 'WorkTime'`, `short_name: 'WorkTime'`.
- `start_url: '/'`, `display: 'standalone'`, `orientation: 'portrait'`, `lang: 'ru'`.
- `background_color` and `theme_color`: `#EAE7DC` (cream).
- Icons: `/icon` (32×32 PNG), `/apple-icon` 180×180 `purpose: 'any'` and `maskable`.

### Service worker (`public/sw.js`)
- Registered by `<RegisterSw />` inside the office layout — **only the office QR page installs it** (dashboard / admin / marketing stay SW-less).
- `VERSION = 'worktime-sw-v1'`. On `install` → `skipWaiting()`. On `activate` → clears prior `worktime-sw-*` caches + `clients.claim()`.
- Fetch strategy:
  - **SSE bypass** (`/stream`, `/stream/*`, or `Accept: text/event-stream`) — no interception. Required because the worker would otherwise buffer SSE and break incremental delivery.
  - **API** (`/api/*`) — network-first, no response caching.
  - **Static assets** (`/_next/static/*`, `/icons/*`, `.css|js|mjs|svg|png|jpg|jpeg|webp|ico|woff2?`) — cache-first into `${VERSION}-static`.
  - Everything else — default fetch.

---

## SWR / Data Layer

- Global config via `src/providers.tsx`: `revalidateOnFocus: false`, `revalidateOnReconnect: true`, `errorRetryCount: 3`, `dedupingInterval: 2000`, no retry on 4xx (`shouldRetryOnError` checks `status >= 400 && < 500`).
- Default fetcher is `@/lib/fetcher` (imports; proxies to the external API base via `@/lib/api`).
- Scroll smoothing via `LenisProvider` wrapping SWR.
- Mutations go through `api.post` / `api.patch` / `api.delete` from `@/lib/api`, which throws `ApiError` instances carrying `status` + parsed body. Pages surface these as `ErrorState` + toasts (see `@/components/ui/use-toast`).

---

## File inventory

```
src/app/
├── layout.tsx                              (RSC, site-wide metadata + fonts + SkipLink)
├── loading.tsx                             (RSC spinner)
├── error.tsx                               (client error boundary)
├── not-found.tsx                           (RSC 404)
├── globals.css
├── icon.tsx                                (Edge OG 32×32)
├── apple-icon.tsx                          (Edge 180×180)
├── opengraph-image.tsx                     (Edge 1200×630)
├── twitter-image.tsx                       (Edge 1200×630)
├── manifest.ts                             (PWA)
├── robots.ts
├── sitemap.ts
├── api/                                    (empty — no internal API routes)
├── (marketing)/
│   ├── layout.tsx                          (RSC shell)
│   └── page.tsx                            (/  → RSC + client islands)
├── (auth)/
│   ├── layout.tsx                          (RSC, concentric-rings SVG)
│   ├── login/page.tsx                      (/login)
│   ├── register/page.tsx                   (/register)
│   └── onboarding/company/page.tsx         (/onboarding/company, AuthGuard)
├── (dashboard)/
│   ├── layout.tsx                          (client, sidebar + top bar)
│   ├── company/[slug]/
│   │   ├── page.tsx                        (/company/[slug])
│   │   ├── employees/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── qr/page.tsx
│   │   └── settings/page.tsx
│   └── freelance/
│       ├── page.tsx                        (/freelance)
│       ├── stats/page.tsx
│       └── projects/
│           ├── page.tsx
│           ├── new/page.tsx
│           └── [id]/page.tsx
├── (admin)/
│   ├── layout.tsx                          (client, 403 gate via /admin/stats)
│   └── admin/
│       ├── page.tsx                        (/admin)
│       └── companies/
│           ├── page.tsx                    (/admin/companies)
│           └── [id]/page.tsx               (/admin/companies/[id])
└── office/[companyId]/qr/
    ├── layout.tsx                          (RSC, fullscreen + RegisterSw)
    └── page.tsx                            (RSC shell + <QrDisplay> client)
```
