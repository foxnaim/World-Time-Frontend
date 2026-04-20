# Contributing to Work Tact

Thanks for contributing! Please follow the rules below so CI and hooks pass.

## Branch naming

- `feature/<short-description>` — new functionality
- `fix/<short-description>` — bug fixes
- `chore/<short-description>` — tooling, deps, refactors, docs

Keep branch names lowercase, hyphen-separated, and scoped to one change.

## Commit convention

We use [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint.

Format: `type(scope): subject`

- **types**: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `build`, `ci`, `perf`, `style`, `revert`
- **allowed scopes**: `backend`, `frontend`, `db`, `types`, `ui`, `config`, `ci`, `docs`, `deps`, `telegram`, `admin`, `billing`, `report`, `auth`, `dashboard`, `landing`, `office`
- Subjects can be written in Russian or English.

Examples:

- `feat(billing): добавить расчёт налогов`
- `fix(auth): refresh token rotation`
- `chore(deps): bump prisma to 5.22`

## Pull request checklist

- [ ] Tests pass (`pnpm test`)
- [ ] Types pass (`pnpm typecheck`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Screenshots attached for any UI changes
- [ ] PR title follows the commit convention

## Running locally

```sh
pnpm install
cp .env.example .env
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Husky hooks install automatically via the `prepare` script. `pre-commit` runs
lint-staged (Prettier + ESLint + `prisma format`), and `commit-msg` validates
the message against commitlint rules.
