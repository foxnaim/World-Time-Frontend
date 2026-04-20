<div align="center">

# ⏱️ Work Tact

**Ритм рабочего дня — time tracking via Telegram and rotating QR codes for B2B offices and B2C freelancers**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Telegram](https://img.shields.io/badge/Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)

</div>

---

## About

<sub>Product codename was **WorkTime**; officially renamed to **Tact** on 2026-04-18. See [REBRAND.md](REBRAND.md).</sub>

Traditional office access-control systems (SKUD) are expensive to install and maintain, while paper attendance logs are unreliable and easy to forge. On the other side of the market, freelancers and remote workers rarely track their real hourly rate, ending the month with a vague sense that they either under- or over-charged every client.

**Tact** solves both problems with one product. For B2B offices, a Telegram bot pairs with a rotating QR code displayed on a screen near the entrance — employees scan, check in, and managers get auto-analytics plus one-click Google Sheets export. For B2C freelancers, the same app turns into a project timer that surfaces your real hourly rate as you work.

## Features

- 📱 **Telegram-First** — Check in via bot + QR, no cards or extra hardware
- 🔄 **Rotating QR** — HMAC-signed, 30s rotation, 45s TTL (anti-fraud)
- 📍 **Geofencing** — Optional GPS check against company coordinates
- 📊 **Auto-Analytics** — Lateness, overtime, punctuality ranking
- 📑 **Sheets Export** — One-click monthly attendance report to Google Sheets
- 💼 **B2C Timer** — Project-based time tracking with real hourly rate insight
- 🎨 **Editorial UI** — Swiss-style design with custom palette and Dial component
- 🔐 **Telegram Auth** — Bot-issued 6-digit codes or Telegram Login Widget
- 🚀 **Production Ready** — Docker, Redis, Sentry, Pino logs, Swagger docs
- 🌍 **i18n** — Russian + English
- 🧩 **Admin Panel** — Cross-company super-admin dashboard
- 💳 **Tier System** — Free / Team / Enterprise with seat limits

## Tech Stack

| Layer         | Technology                                                           |
| ------------- | -------------------------------------------------------------------- |
| Frontend      | Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, Lenis |
| Backend       | NestJS 10, Prisma 5, TypeScript, nestjs-telegraf                     |
| Database      | PostgreSQL 16, Redis 7                                               |
| Infra         | Docker, docker-compose, Nginx, Turborepo, pnpm workspaces            |
| Auth          | JWT (jose), Telegram Login, bot-issued OTC                           |
| Testing       | Jest, Vitest, Playwright                                             |
| Observability | Pino, Sentry, Swagger/OpenAPI                                        |
| DX            | ESLint, Prettier, Husky, lint-staged, Commitlint                     |

## Architecture

```mermaid
flowchart LR
    TG[Telegram Bot] -->|check-in / OTC| API[NestJS API]
    WEB[Next.js Web] -->|REST + JWT| API
    DISPLAY[Office Display<br/>Rotating QR] -->|SSE| API
    API --> PG[(PostgreSQL 16)]
    API --> RDS[(Redis 7)]
    API -->|monthly export| GS[Google Sheets]
```

The Telegram bot and the office display are the two ingress points for attendance events. The NestJS API signs QR payloads with HMAC, pushes rotations over Server-Sent Events to the display, and persists check-ins to Postgres. Redis holds the short-lived QR nonces and rate-limit counters. The web dashboard is a Next.js client that talks to the same API with JWTs issued by either Telegram Login Widget or a bot-issued one-time code.

## Project Structure

```
WorkTime/
├── backend/                 # NestJS API + Telegram bot
├── frontend/                # Next.js 15 web app
├── packages/
│   ├── database/            # Prisma schema + client
│   ├── types/               # Shared TS types
│   ├── ui/                  # Shared React components
│   └── config/              # ESLint / TS / Tailwind presets
├── nginx/                   # Reverse-proxy config
├── docs/                    # ADRs, architecture, security
├── scripts/                 # Dev + deploy helpers
├── docker-compose.yml
└── turbo.json
```

## Getting Started

```bash
# 1. Clone
git clone https://github.com/foxnaim/WorkTime.git
cd WorkTime

# 2. Install
pnpm install

# 3. Configure
cp .env.example .env

# 4. Start Postgres + Redis
docker compose up -d

# 5. Apply schema + seed
pnpm db:push && pnpm db:seed

# 6. Run all apps
pnpm dev
```

Then open:

- Web — http://localhost:3000
- API — http://localhost:4000
- Swagger — http://localhost:4000/api/docs
- Prisma Studio — `pnpm db:studio`

## Scripts

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `pnpm dev`         | Run web + API + bot in watch mode        |
| `pnpm build`       | Build all workspaces via Turborepo       |
| `pnpm lint`        | Lint all packages                        |
| `pnpm test`        | Run Jest + Vitest suites                 |
| `pnpm e2e`         | Run Playwright end-to-end tests          |
| `pnpm db:push`     | Sync Prisma schema to the database       |
| `pnpm db:seed`     | Seed demo company, users, and projects   |
| `pnpm db:studio`   | Open Prisma Studio                       |
| `pnpm docker:up`   | Start infra containers (Postgres, Redis) |
| `pnpm docker:down` | Stop infra containers                    |

## Palette

| Swatch                                                         | Name  | Hex       |
| -------------------------------------------------------------- | ----- | --------- |
| <img src="https://via.placeholder.com/20/EAE7DC/EAE7DC.png" /> | Cream | `#EAE7DC` |
| <img src="https://via.placeholder.com/20/D8C3A5/D8C3A5.png" /> | Sand  | `#D8C3A5` |
| <img src="https://via.placeholder.com/20/8E8D8A/8E8D8A.png" /> | Stone | `#8E8D8A` |
| <img src="https://via.placeholder.com/20/E98074/E98074.png" /> | Coral | `#E98074` |
| <img src="https://via.placeholder.com/20/E85A4F/E85A4F.png" /> | Red   | `#E85A4F` |

## Repositories

GitHub repos still carry their original names; the product is now called **Tact**.

- Monorepo — [foxnaim/WorkTime](https://github.com/foxnaim/WorkTime)
- Backend mirror — [World-Time-back-End](https://github.com/foxnaim/World-Time-back-End)
- Frontend mirror — [World-Time-Frontend](https://github.com/foxnaim/World-Time-Frontend)

## Documentation

- [Architecture Decision Records](docs/adr/)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Security Checklist](docs/SECURITY_CHECKLIST.md)
- [Backend Docs](backend/docs/)
- [Frontend Docs](frontend/docs/)

## Contributing

Pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow, commit conventions, and code-style rules.

## License

MIT © [foxnaim](https://github.com/foxnaim)
