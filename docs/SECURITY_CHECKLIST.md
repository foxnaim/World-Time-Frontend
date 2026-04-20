# Operator Security Checklist

Walk through this list before a production deploy, and again every
quarter. It is deliberately short enough to read in one sitting — if
you find yourself skipping items, flag them to the team rather than
silently ignoring them.

## Secrets

- [ ] `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `QR_HMAC_SECRET` are each at
      least 32 bytes of cryptographically-random data (`openssl rand
    -base64 48`). No shared values across the three.
- [ ] Secrets are rotated **every 90 days** on a calendar reminder, and
      immediately if a leak is suspected.
- [ ] `TELEGRAM_BOT_TOKEN` lives in the platform secret manager (AWS
      Secrets Manager, GCP Secret Manager, Vault). It is **not** in a
      checked-in `.env` file, not in a shared password manager note, and
      not pasted into Slack.
- [ ] `NEXTAUTH_SECRET` / `SESSION_SECRET` equivalents follow the same
      rules as JWT secrets.
- [ ] No secret appears in container image layers (`docker history` is
      clean).
- [ ] Sentry DSN is set and verified with a test event; error payloads
      are scrubbed of PII (email, phone, Telegram IDs).

## Database & cache

- [ ] `DATABASE_URL` uses TLS in production (`sslmode=require` or
      stronger). Self-signed certificates are pinned.
- [ ] Postgres is on a private network; no public `0.0.0.0/0` ingress on
      port 5432.
- [ ] The application DB user has the **minimum** privileges it needs —
      no `SUPERUSER`, no `CREATEDB` unless migrations demand it.
- [ ] Redis has `requirepass` set; ACL-restricted user for the app.
- [ ] Redis is not exposed on a public interface.
- [ ] `pg_dump` runs daily, is encrypted at rest (SSE-KMS or equivalent),
      and retained for **14 days**. Restores are tested at least
      quarterly.

## Network & TLS

- [ ] Nginx terminates TLS with a modern cipher suite
      (`ssl_protocols TLSv1.2 TLSv1.3` at minimum; drop 1.2 when clients
      allow).
- [ ] HSTS is asserted in the nginx config with a long `max-age` and
      `includeSubDomains`. Only enable `preload` once you have committed
      to HTTPS forever on this domain.
- [ ] CSP is reviewed at both the nginx layer and the Next.js
      `next.config.ts` layer. They should not contradict each other.
      After any change, open the site in a browser and check DevTools
      for CSP violations.
- [ ] Let's Encrypt / ACME auto-renew is working; alerts fire if a
      certificate has <14 days to expiry.

## Application hardening

- [ ] Helmet is enabled in the NestJS bootstrap (see
      `backend/src/common/security/helmet.config.ts`).
- [ ] `compression` middleware is on or offloaded to nginx.
- [ ] CORS `origin` is an explicit allow-list of your web + admin
      origins — never `*` in production.
- [ ] Rate limits are tuned for each throttler group. Review the
      `@Throttle()` decorators after any endpoint change.
- [ ] QR display endpoints are only reachable with a valid
      `X-Display-Key` header. Periodically audit the set of issued
      display keys and revoke unused ones.
- [ ] Super-admin Telegram IDs are reviewed **quarterly**; offboarded
      staff are removed the same day.
- [ ] Dependabot (or equivalent) is enabled on the repo and PRs are
      merged within a week for high-severity advisories.

## Data protection

- [ ] GPS coordinates are never shared with third parties. They are
      purged from primary storage after **180 days** and from backups
      after **365 days**.
- [ ] User-identifying data in logs is minimized; pino redaction paths
      cover `req.body.password`, `req.body.token`, `authorization`,
      `cookie`, and any new sensitive fields you add.
- [ ] Telegram message contents are not logged beyond what is needed for
      debugging a specific incident.
- [ ] Export features (CSV, PDF) require re-authentication for large
      ranges.

## Operational

- [ ] Access logs are shipped to central storage and **audited weekly**
      for anomalies (spikes of 4xx/5xx, unusual IP ranges, admin actions
      outside business hours).
- [ ] On-call rotation is documented and the primary has working pager
      credentials for Sentry, the hosting provider, and Telegram.
- [ ] Runbooks exist for: secret rotation, DB restore, revoking a
      compromised admin session, rolling back a bad deploy.
- [ ] Staging and production are separate — no shared databases, no
      shared secrets, no shared Telegram bots.

## Legal & compliance

- [ ] A current privacy policy is published and linked from the footer.
- [ ] A data processing agreement is in place with every customer whose
      data is identifiable.
- [ ] Subprocessor list (hosting, Sentry, Telegram, email provider) is
      current and linked from the privacy policy.
- [ ] GDPR / data-subject requests have a documented workflow with an
      SLA.

## Review cadence

Owner: Security lead. Revisit this checklist:

- Before every production deploy that touches auth, billing, or PII.
- On the first Monday of each calendar quarter.
- Immediately after any reported incident, whether or not it turned out
  to be a real vulnerability.

Last reviewed: _fill in on each pass._
