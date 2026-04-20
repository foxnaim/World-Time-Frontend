# Security Policy

Work Tact treats security issues seriously. This document explains how to
report a vulnerability, what to expect from us, and which versions we
currently support with fixes.

## Reporting a vulnerability

**Please email us at [info@aoneagency.kz](mailto:info@aoneagency.kz).**

Do **not** open a public GitHub issue, pull request, or chat message for
anything you believe to be a security issue. Private disclosure gives us
time to ship a fix before the details are public and protects the people
who use Work Tact in production.

A good report includes:

- A clear description of the issue and its impact.
- A minimal set of steps or a proof-of-concept that demonstrates the
  problem. A short video or screenshots help.
- The affected component (backend API, frontend, office terminal,
  Telegram bot, nginx configuration, deployment scripts).
- The version or commit SHA you tested against.
- Your preferred credit name, or a note that you prefer to remain
  anonymous.

If the issue is actively being exploited or you have reason to believe an
attack is in progress, put **`[URGENT]`** at the start of the subject
line. We treat those mails as pager traffic.

### PGP

If you would like to encrypt your report, mention that in a first plain
email and we will reply with a current PGP key. We do not publish a
long-lived key in-tree because rotation is easier if we hand it out
per-reporter.

## Our response SLA

| Phase                                    | Target                                 |
| ---------------------------------------- | -------------------------------------- |
| Acknowledgement of receipt               | **24 hours**                           |
| Initial triage + severity classification | **72 hours**                           |
| Status update cadence until resolution   | Weekly, more often for critical issues |
| Fix for critical issues                  | As fast as we can safely ship          |
| Fix for high issues                      | Within 14 days of triage               |
| Fix for medium/low issues                | Within 60 days of triage               |

Severity is assessed against the deployed SaaS posture, not a worst-case
hypothetical. An issue that requires a malicious super-admin, for
example, is scored lower than one exploitable by an unauthenticated
visitor.

If you have not heard back within 72 hours of your initial email, please
follow up — it is almost certainly a mail delivery problem on our end.

## Coordinated disclosure

We ask reporters to hold public disclosure until a fix is deployed, or
until **90 days** have passed since the initial report, whichever comes
first. If we need more than 90 days we will explain why and agree a new
date with you rather than simply missing the deadline. You are free to
disclose immediately if we stop responding.

## Supported versions

Work Tact is delivered as a continuously-deployed SaaS plus a
self-hostable Docker Compose bundle. We support:

| Version line               | Supported | Notes                               |
| -------------------------- | --------- | ----------------------------------- |
| `main` (SaaS + latest tag) | Yes       | All security fixes ship here first. |
| Previous minor release     | Yes       | Backport critical + high fixes.     |
| Older minor releases       | No        | Please upgrade.                     |
| Any fork                   | No        | Report upstream; we will credit.    |

## Scope

**In scope:**

- `backend/` (NestJS API, including Telegram bot integration)
- `frontend/` (Next.js dashboard and office terminal)
- `packages/` (shared libraries)
- `nginx/` configuration shipped in this repository
- `docker-compose.*.yml` as shipped
- Deployment scripts in `deploy/`

**Out of scope:**

- Third-party services we integrate with (Telegram, Google APIs, Sentry)
  — please report those upstream. If the bug is in how _we use_ the
  integration, it is in scope.
- Attacks that require physical access to a user's device or the office
  terminal hardware, unless the software does something that materially
  worsens the attacker's position (e.g. leaks secrets on disk in the
  clear).
- Denial of service by volumetric flooding at the network layer. Logic
  DoS against specific endpoints **is** in scope.
- Social engineering of staff.
- Findings derived solely from automated scanners with no verified
  impact.

## Recognition

We maintain a `SECURITY-THANKS.md` file for researchers who have
responsibly disclosed issues to us. If you would like to be listed
there, mention that in your report and we will add you when the fix
ships. We do not currently operate a paid bug bounty program, but we
are happy to send swag to reporters whose fixes ship.

## Operator responsibilities

Running your own instance of Tact? See
[`docs/SECURITY_CHECKLIST.md`](docs/SECURITY_CHECKLIST.md) for the
deployment hardening checklist. Vulnerabilities caused by operator
misconfiguration (e.g. weak `JWT_SECRET`, database exposed to the public
internet) are not defects in Work Tact itself — but if you find that the
default configuration encourages such mistakes, please tell us.
