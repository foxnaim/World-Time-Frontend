# 5. Telegram is the primary authentication channel

- Status: Accepted
- Date: 2026-04-17
- Deciders: Core team (backend, security, product)
- Tags: auth, identity, telegram

## Context and Problem Statement

We need to authenticate users on the dashboard. The classic SMB playbook is
email+password or phone+SMS OTP. Both are problematic for us:

- SMS OTP requires a gateway contract, per-message costs, regional
  deliverability quirks, and fraud controls.
- Email+password is known-weak on mobile; password reset flows need
  email infrastructure and add friction.
- Our product already lives inside Telegram via the check-in bot. Every
  user is already, by construction, a Telegram user.

Using Telegram as the identity anchor also dovetails with ADR-0002
(telegramId as authoritative identity for check-ins).

## Considered Options

1. Email + password.
2. Phone + SMS OTP.
3. **Telegram as primary: bot-issued 6-digit one-time code ("Flow B") for
   MVP; Telegram Login Widget ("Flow A") as secondary. JWT issued on
   success. Session state in Redis when available, in-memory fallback.**
4. OAuth (Google / Apple) as primary.

## Decision

We adopt **Option 3**.

Flows:

- **Flow B (primary, MVP)**: user enters their Telegram username or ID
  in the dashboard; the bot DMs them a 6-digit code with a short TTL
  (5 minutes); the user enters the code to complete sign-in. This works
  even when the user is on a desktop browser unrelated to their Telegram
  session.
- **Flow A (secondary)**: Telegram Login Widget on the sign-in page for
  users who are already signed into Telegram Web or the desktop app. One
  click, no code entry.

On successful verification we issue a JWT (short-lived access token plus
a refresh flow). Session metadata (device, last seen, revocation bit)
lives in **Redis** when available, with an **in-memory fallback** for
local dev and bare-bones deployments.

## Consequences

Positive:

- Zero SMS costs, zero SMS gateway contracts.
- Account recovery is "open Telegram" — an account users already protect.
- Identity is consistent end-to-end: the same telegramId authenticates
  the dashboard and authorizes check-in scans.
- No password storage, no password reset surface.

Negative / tradeoffs:

- The user must have Telegram. In our target markets (CIS, MENA, parts
  of LATAM, parts of EU) this is already true for the buyer demographic.
  Acceptable — documented as a prerequisite.
- Users who block DMs from unknown bots (a Telegram privacy setting) may
  need to tap "Start" on the bot before the code arrives. We detect this
  and surface a "Open the bot" CTA.
- Dependency on Telegram's availability. We accept this; if Telegram is
  down, check-ins are also impacted, so degraded auth is not the
  bottleneck.

Neutral:

- Email can still be collected as a contact channel for reports and
  invoices; it is not a login primitive.
- If regulation ever requires a non-Telegram auth channel we can add
  email-link (magic link) as a fallback without restructuring the JWT
  layer.

---

_Originally authored under project codename WorkTime; product renamed to Work Tact 2026-04-18._
