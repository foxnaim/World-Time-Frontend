# WorkTime Production Deploy

Single-host Docker deployment behind Caddy (auto TLS).

**1. Secrets & env**
```bash
cp ../.env.example ../.env.production   # fill in real values
mkdir -p secrets
printf '%s' 'STRONG_DB_PASSWORD' > secrets/postgres_password.txt
chmod 600 secrets/postgres_password.txt
```
Edit `Caddyfile`: replace `yourdomain.com` / `api.yourdomain.com` with real
domains, point DNS A records at this host, open ports 80/443.

**2. Start the stack (from repo root)**
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```
Caddy provisions Let's Encrypt certs on first start.

**3. First-run migrations**
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  exec backend pnpm --filter backend db:migrate
```

**4. Backups**
Schedule `pg_dump` (or snapshot `pg_data_prod`). Back up `caddy_data` too so
restarts reuse issued certs. Redis is cache-only.
