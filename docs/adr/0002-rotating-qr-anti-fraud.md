# 2. Rotate QR every 30s, geofence, and bind identity to Telegram

- Status: Accepted
- Date: 2026-04-17
- Deciders: Core team (backend, product, security-minded reviewer)
- Tags: security, anti-fraud, check-in

## Context and Problem Statement

The core check-in flow is: an employee arrives at the workplace, scans a QR
code displayed on a screen or poster, and the system records a Shift start.
A static QR code is trivially attackable: an employee photographs it once
and scans the photo from home forever. This defeats the entire premise of
a time-tracking product.

We need a check-in mechanism that is:

- Resistant to remote scans (the QR must not be reusable from a photo).
- Usable on any employee phone without extra hardware.
- Tolerant of slight clock skew and network latency (a scan that takes
  2–3 seconds to reach the server must still succeed).
- Able to prove _which human_ scanned — not just "somebody with a phone".

## Considered Options

1. Static QR per location.
2. **Rotating QR: HMAC-signed token, 30s rotation, 45s TTL, optional
   geofence from Company coordinates, telegramId as authoritative identity.**
3. NFC tag at the workplace.
4. Biometric check-in (face / fingerprint via phone).
5. Bluetooth beacon presence.

## Decision

We adopt **Option 2**.

Mechanics:

- Each Location holds a secret. The display screen shows a QR that encodes
  `{companyId, locationId, issuedAt, nonce, hmac}`, where `hmac` is
  computed over the payload with the Location secret.
- Tokens rotate every **30 seconds**. The server accepts tokens with
  `issuedAt` within the last **45 seconds** to tolerate scan + network
  latency.
- An optional **geofence** check compares the client's coarse location
  against the Company coordinates at scan time. Companies can opt in per
  location.
- Identity is bound to **telegramId**, not to a phone number or email.
  The scanning client must be signed in via Telegram (see ADR-0005), and
  the check-in is recorded against that telegramId.

Alternatives rejected:

- **NFC** requires hardware at every workplace and reliable NFC on every
  phone; it is also clonable without extra signing. Not worth the cost.
- **Biometric** is disproportionate for the threat model, raises privacy
  and legal concerns in our markets, and excludes employees whose phones
  lack the sensors.
- **Bluetooth beacons** need hardware, pairing quirks, and drain batteries;
  same remote-presence risks without user interaction.

## Consequences

Positive:

- A photographed QR becomes useless within ~45 seconds.
- Geofence raises the bar from "share a photo with a friend" to "also
  spoof GPS while signed into the right Telegram account".
- No additional hardware at the workplace beyond the display.
- Telegram identity binding makes account-sharing visible (one telegramId,
  many locations → fraud signal).

Negative / tradeoffs:

- Requires a display capable of refreshing the QR (phone, tablet, or
  monitor) at the workplace. A paper printout will not work.
- Employees who disable location services cannot use geofenced locations;
  companies must choose.
- Clock drift on the display can cause valid tokens to appear expired; we
  rely on NTP and ship a server-side skew allowance.

Neutral:

- The rotation interval (30s) and TTL (45s) are tunable per-company if
  real-world deployment reveals different latency profiles.

---

_Originally authored under project codename WorkTime; product renamed to Work Tact 2026-04-18._
