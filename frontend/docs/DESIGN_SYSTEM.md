# WorkTime — Editorial Design System

> A living reference for the surfaces, tokens, and motion that give WorkTime its
> editorial tone. Grounded in `@worktime/ui` and `frontend/tailwind.config.ts`.

This document is prescriptive. If you find yourself introducing a new color, a
new font family, or a shadow heavier than `shadow-sm`, stop — the system almost
certainly already has an answer, or the answer should be "no."

---

## 1. Design Principles

1. **Editorial over SaaS.** The visual language is drawn from
   [exteta.com](https://exteta.com) and the Locus Solus family of sites:
   Fraunces serif display, Inter UI, hairline borders, generous whitespace,
   deliberate silence. Surfaces should feel more like a printed programme than a
   product dashboard.
2. **Palette first.** Five hex tokens carry the entire product. There are no
   gradients and no decorative shadows. Color meaning is enforced by role
   (background, body, accent, emphasis), not by mood.
3. **Dial motif.** The circular SVG gauge is the brand element. It is reused
   across the hero landing, the office QR countdown, KPI cards, and the auth
   loader. If you need a visual anchor for numeric or temporal data, reach for
   `<Dial />` before anything else.
4. **Motion with restraint.** Framer Motion is used for staggered reveals and a
   single spring on the Dial indicator — nothing bouncier. All motion respects
   `prefers-reduced-motion`.
5. **Typography ratio.** Fraunces `text-12xl` down to `text-2xl` for display and
   numerics; Inter at 16 / 14 / 12 for UI; a 10px `tracking-[0.28em]` small-cap
   eyebrow for every section header.

The feeling we are after: a quiet page, a single coral accent, a dial that
moves when something real changes.

---

## 2. Palette

The entire system is five tokens. Memorise them.

| Token   | Hex        | RGB             | Role           | Usage                                       |
|---------|------------|-----------------|----------------|---------------------------------------------|
| cream   | `#EAE7DC`  | 234 · 231 · 220 | Primary bg     | Default page background, button text on coral |
| sand    | `#D8C3A5`  | 216 · 195 · 165 | Secondary bg   | CTA panels, warm accents, sand badge bg     |
| stone   | `#8E8D8A`  | 142 · 141 · 138 | Body text      | All body copy, hairlines (at alpha), icons  |
| coral   | `#E98074`  | 233 · 128 · 116 | Accent         | Links, primary CTAs, Dial indicator, focus ring |
| red     | `#E85A4F`  | 232 ·  90 ·  79 | Emphasis       | Errors, alerts, late metrics, hover on primary |

### Tailwind usage

All five tokens are registered as top-level Tailwind colors
(`frontend/tailwind.config.ts`):

```ts
colors: {
  cream: '#EAE7DC',
  sand:  '#D8C3A5',
  stone: '#8E8D8A',
  coral: '#E98074',
  red:   '#E85A4F',
},
```

Use them by name — never inline hex in feature code:

```tsx
<div className="bg-cream text-stone border border-stone/20">
  <a className="text-coral hover:text-red">Open report</a>
</div>
```

Canonical alpha steps for stone on cream (hairlines and subdued copy):

| Step        | Use for                                       |
|-------------|-----------------------------------------------|
| `stone/75`  | High-contrast mode body text                  |
| `stone/60`  | Major tick marks, active labels               |
| `stone/40`  | Input borders, default hairlines              |
| `stone/25`  | Minor tick marks                              |
| `stone/20`  | Card borders, table dividers                  |
| `stone/12`  | Inner dial ring                               |

### CSS variables

`globals.css` mirrors the Tailwind palette so vanilla CSS, inline styles, and
SVG `stroke`/`fill` have first-class access:

```css
:root {
  --cream: #EAE7DC;
  --sand:  #D8C3A5;
  --stone: #8E8D8A;
  --coral: #E98074;
  --red:   #E85A4F;
}
```

The same values are exported as a JS constant from `@worktime/ui`:

```ts
import { COLORS } from '@worktime/ui';
// COLORS.coral === '#E98074'
```

Use `COLORS` inside SVG primitives (`<Dial />`, `<ScrollTick />`) where a
literal stroke/fill value is required.

### Palette rules

- Never introduce a sixth color. If you need "warning yellow," find out whether
  the status is late (`red`) or pending (`sand` with `stone` text).
- No gradients. Not for heroes, not for CTAs, not for empty states.
- No semi-transparent cream or sand on sand — it muddies. Stone on cream is
  the only overlay relationship that is allowed to stack.

---

## 3. Typography

Two families. No others.

| Stack        | Family                     | Weights  | Usage                                         |
|--------------|----------------------------|----------|-----------------------------------------------|
| `font-serif` | Fraunces (variable `opsz`) | 400 / 500 / 600 | Display headlines, KPI numerics, Dial labels |
| `font-sans`  | Inter                      | 400 / 500 / 600 | All UI text: body, labels, buttons, tables    |

Both are loaded via Next.js `next/font` and wired through Tailwind as CSS vars:

```ts
fontFamily: {
  sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
  serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
}
```

### Scale

| Size        | Tailwind                       | Family       | Usage                             |
|-------------|--------------------------------|--------------|-----------------------------------|
| 10px        | `text-[10px]`                  | Inter        | Eyebrows, small caps, badges      |
| 12px        | `text-xs`                      | Inter        | Captions, micro-labels            |
| 14px        | `text-sm`                      | Inter        | Secondary body, dense tables      |
| 16px        | `text-base`                    | Inter        | Default body                      |
| 20px        | `text-xl`                      | Inter/Serif  | Card titles (medium weight)       |
| 24px        | `text-2xl`                     | Serif        | H3                                |
| 40px        | `text-4xl`                     | Serif        | H2                                |
| 60 – 128px  | `text-6xl` … `text-9xl`        | Serif        | Hero display                      |
| fluid       | `text-display` / `text-hero`   | Serif        | Hero clamp (`3rem → 7rem`)        |

Two fluid sizes are registered in `tailwind.config.ts` for when a hero must
breathe across breakpoints:

```ts
fontSize: {
  'display': ['clamp(3rem, 8vw, 7rem)',   { lineHeight: '0.95', letterSpacing: '-0.03em' }],
  'hero':    ['clamp(2.25rem, 5vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.025em' }],
}
```

### Letter-spacing

Two editorial presets live alongside Tailwind's defaults:

- `tracking-editorial`       — `-0.02em`, for display serif lines.
- `tracking-editorial-wide`  — `0.06em`,  for mid-sized stone labels.

Eyebrows use `tracking-[0.22em]` (inside the `@worktime/ui` primitives) or
`tracking-[0.28em]` (for hero-level eyebrows). Never dip below `0.18em` for
an UPPERCASE small-cap — the letters collide.

### Typographic rules

- Fraunces is **only** for display and numerics. Never use it for paragraph
  body text — the `opsz` axis is tuned for display sizes and it reads as
  decorative below 20px.
- Eyebrows are UPPERCASE Inter, 10px, `tracking-[0.22em]` or wider,
  `text-stone` (or `text-stone/70` on already-subdued backgrounds).
- H1 serifs carry `tracking-tight` or `tracking-editorial`. Never space-out
  serif display.
- Prefer `font-medium` (500) over `font-semibold` (600) for Fraunces — the
  opsz variant already feels heavier than its nominal weight.

---

## 4. Components — `@worktime/ui`

The shared component package. Each primitive is < 100 LOC and deliberately
opinionated. Import via the package entry:

```ts
import { Button, Card, Badge, Input, Dial, ScrollTick, COLORS } from '@worktime/ui';
```

### 4.1 Dial

The brand gauge. Driven entirely by SVG + a single Framer Motion `motion.g`
rotation for the indicator.

```tsx
<Dial
  size={520}
  progress={0.72}
  ticks={60}
  highlightStart={9 / 24}
  highlightEnd={18 / 24}
  label="09:00 – 18:00"
  sublabel="EXTETA DEMO"
  indicatorColor="coral"
/>
```

**Props**

| Prop             | Type                  | Default  | Notes                                           |
|------------------|-----------------------|----------|-------------------------------------------------|
| `size`           | `number` (px)         | `520`    | Square SVG side.                                |
| `progress`       | `number` 0..1         | —        | Indicator position around the dial.             |
| `ticks`          | `number`              | `60`     | Every 5th tick is rendered as major.            |
| `highlightStart` | `number` 0..1         | —        | Start fraction of the coral arc segment.        |
| `highlightEnd`   | `number` 0..1         | —        | End fraction. Both must be set to render.       |
| `label`          | `React.ReactNode`     | —        | Fraunces, 5xl/6xl, centered over the dial.      |
| `sublabel`       | `React.ReactNode`     | —        | 10px UPPERCASE, tracked out at 0.28em.          |
| `indicatorColor` | `ColorToken`          | `coral`  | Any palette token from `@worktime/ui/tokens`.   |

**Behaviour**

- Progress is clamped to `[0, 1]`.
- Indicator motion: `spring` with `stiffness: 60, damping: 18, mass: 0.8`.
- Accessible name is synthesised from `label` / `sublabel` (or falls back to
  `"Dial at N%"`) and emitted via `role="img"` + `aria-label`.

**Used in**

- Hero landing — full-bleed 520px dial with the working-hours arc.
- Office QR countdown — smaller dial bound to seconds-until-refresh.
- Dashboard KPI empty states — 240px dial with no highlight arc.
- Auth loader — 128px dial with `progress` linked to token-exchange progress.

### 4.2 Button

CVA variants, Framer `whileTap` scale 0.98, and an `asChild` slot for wrapping
links.

```tsx
<Button variant="primary" size="md" onClick={handleSave}>
  Save
</Button>

<Button asChild variant="ghost">
  <Link href="/reports">Open reports</Link>
</Button>
```

**Variants**

| Variant   | Background          | Text         | Border                        | Hover                          |
|-----------|---------------------|--------------|-------------------------------|--------------------------------|
| `primary` | `coral`             | `cream`      | transparent                   | `bg-red`                       |
| `ghost`   | transparent         | `stone`      | `stone/40`                    | text `coral`, border `coral/60` |
| `outline` | `cream`             | `red`        | `coral`                       | `bg-sand/40`                   |

**Sizes**: `sm` (h-8, px-3, xs) · `md` (h-10, px-5, sm) · `lg` (h-12, px-7, base).

All variants are fully rounded (`rounded-full`), use Inter medium, and share a
coral focus ring with cream offset.

### 4.3 Card

A rounded hairline container. No decorative shadows — just a 1px inset shadow
to lift it off cream.

```tsx
<Card eyebrow="Today" title="Clocked in">
  <p>14 of 22 employees on shift.</p>
</Card>
```

- `rounded-2xl`, `border border-stone/20`, `bg-cream/60` with a whisper of
  backdrop-blur for layered hero surfaces.
- Header gap: `mb-5`. Eyebrow: 10px UPPERCASE `tracking-[0.22em]`.
- Title: `text-xl md:text-2xl`, `font-medium`, `tracking-tight`.
- Body children inherit `text-stone`.

### 4.4 Badge

Pill. 10px UPPERCASE, `tracking-[0.18em]`, hairline border.

| Variant   | Use case                                        |
|-----------|-------------------------------------------------|
| `neutral` | Default status chips                            |
| `coral`   | Active / in-progress                            |
| `red`     | Late, error, over budget                        |
| `sand`    | Scheduled, pending, warm informational          |

### 4.5 Input

A borderless input with a single hairline bottom. Focus state swaps the stone
hairline for a coral one — no box-shadow ring on the input itself.

- Optional `label` prop renders a stacked eyebrow label.
- `focus:outline-none`, `focus:ring-0`, `focus:border-coral`.
- `rounded-none` by design — the underline *is* the shape.

### 4.6 ScrollTick

Horizontal tick ruler. Used beneath timeline sections and above data tables
to reinforce the dial language on flat surfaces.

```tsx
<ScrollTick
  count={48}
  majorEvery={6}
  height={48}
  labels={[
    { at: 0,    text: '00:00' },
    { at: 0.5,  text: '12:00' },
    { at: 1,    text: '24:00' },
  ]}
/>
```

- Major ticks render 18px tall at 60% opacity; minor ticks 8px at 25%.
- Labels are absolutely positioned with percentage `left` so the ruler is
  fully responsive without layout math in the parent.

---

## 5. Component Primitives — `frontend/src/components`

Feature-side components that compose `@worktime/ui` primitives into product
affordances. They live in `frontend/src/components/<domain>/…`.

| Component       | Shape                                                                            |
|-----------------|----------------------------------------------------------------------------------|
| `CodeInput`     | 6-box OTP input; per-character auto-advance, paste → fill-all, `aria-live` error |
| `FormField`     | `label` + `Input` + `hint` + `error`; shared hairline bottom, stacked eyebrow    |
| `NumberInput`   | Numeric `Input` with `+` / `−` steppers; clamps to `min`/`max`                   |
| `Slider`        | Native `<input type="range">` styled with a coral thumb on a stone track         |
| `Modal`         | Portal-less overlay; focus trap, `aria-modal`, `aria-labelledby`, `Esc` closes   |
| `Toast`         | Queue-based, 2s auto-dismiss, `aria-live="polite"`                              |
| `Dropdown`      | `<details>`/`<summary>` primitive with a click-outside close hook                |
| `StepProgress`  | Tick-based progress indicator; reuses `ScrollTick` geometry under the hood       |

Shared scaffolding lives in `frontend/src/components/shared`:

- `skip-link.tsx`       — accessibility skip link, jumps to `#main-content`.
- `auth-guard.tsx`      — client boundary that redirects unauthenticated views.
- `locale-switcher.tsx` — locale toggle, will drive the future `<html lang>` sync.
- `logout-button.tsx`   — ghost Button preset wired to the logout action.
- `telegram-login.tsx`  — Telegram auth widget wrapper.

When composing a feature-side component:

1. Reach for the `@worktime/ui` primitive first — even if you only use half of it.
2. Only reach for a raw `<input />` / `<button />` if you are extending a
   primitive with feature state (OTP, stepper, etc.).
3. Never re-implement Button, Card, Modal, or Dial. If you need a variation,
   add it to the primitive.

---

## 6. Motion

We use Framer Motion sparingly. There is one reveal preset and one spring.

```ts
// src/lib/motion.ts
export const reveal = {
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }, // custom editorial ease
};

export const dialSpring = {
  type: 'spring',
  stiffness: 60,
  damping: 18,
  mass: 0.8,
} as const;

export const tapSpring = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
} as const;
```

Usage conventions:

- Staggered reveals on a grid: clone `reveal` and add `transition.delay: i * 0.05`.
- Buttons: already wired — `whileTap={{ scale: 0.98 }}` + `tapSpring`.
- Dial: already wired — `animate={{ rotate: rotationDeg }}` + `dialSpring`.

### Reduced motion

`globals.css` carries a global override:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}
```

This wins against Framer because Framer uses the browser animation API under
the hood. For JS-driven tweens (e.g. canvas), honour the preference manually
with `window.matchMedia('(prefers-reduced-motion: reduce)')`.

---

## 7. Iconography

There is no icon library. Where an icon is needed, it is inline SVG inside the
component that renders it — typically 16px or 20px square, `stroke={COLORS.stone}`,
`stroke-width: 1.5`, rounded caps and joins.

Rules:

- Stroke-based, not filled. Fills are reserved for the dial indicator.
- `currentColor` is fine when the icon lives inside a palette-aware wrapper
  (e.g. a Button variant that flips color on hover).
- Never ship an icon heavier than 1.5px stroke at 20px. The editorial tone
  collapses if icons feel chunky next to Fraunces.

If an icon repeats in three or more places, promote it to a dedicated inline
component under `frontend/src/components/icons/` — still inline SVG, still no
library.

---

## 8. Accessibility

Non-negotiable — the a11y checklist ships alongside the component.

- **Skip link.** `components/shared/skip-link.tsx` jumps to `#main-content`.
  Layouts must render `<main id="main-content" tabIndex={-1}>`.
- **Focus rings.** A custom `.focus-ring-coral` utility in `globals.css` gives
  keyboard users a 2px coral ring with a cream offset. All interactive
  primitives already apply it; wrappers should preserve, not override.
- **Prefers-contrast.** When `prefers-contrast: more`, hairlines are bumped
  from `stone/20` to `stone/75` and body text from `stone/50` to `#4a4945`.
- **ARIA live regions.** The toast queue, QR status region, and `CodeInput`
  error channel are all `aria-live="polite"` (or `assertive` for submission
  failures). Never use `aria-live` on decorative copy.
- **Modal.** Focus trap, `role="dialog"`, `aria-modal="true"`, and an
  `aria-labelledby` pointing to the title. `Esc` closes. Restores focus to
  the opener on close.
- **Tables.** Employees, schedules, and reports render as semantic `<table>`s
  wrapped in `<div role="region" aria-label="…">` for keyboard scroll
  containers.
- **Language.** `<html lang="ru">` ships today. When the locale switcher
  matures, it must update `document.documentElement.lang` in sync.
- **Color contrast.** Stone-on-cream body text meets WCAG AA at 16px. Smaller
  (12px and below) copy uses full `text-stone` — not `/70` — to keep ratios.

### Component-level checks

- `Dial` has `role="img"` and a synthesised `aria-label` so screen readers can
  announce "09:00 – 18:00 — EXTETA DEMO" instead of a blank SVG.
- `Button` hover and focus are distinguishable without relying on color alone
  (scale feedback on tap, ring on focus).
- `Input` labels are always rendered — visually or via `aria-label` when the
  field lives next to an already-explanatory prefix/icon.

---

## 9. Do / Don't

**Do**

- Use palette tokens via Tailwind (`bg-cream`, `text-coral`, `border-stone/20`).
  Never inline hex in feature code.
- Reserve Fraunces for display and numerics. Inter is for every UI label.
- Use hairlines (`border-stone/20` or the `.hairline*` utility) over drop shadows.
- Use the `.hairline-t`, `.hairline-b`, `.hairline-x`, `.hairline-y` utilities
  for partial borders — they are shorter and more intentional than raw Tailwind.
- Announce state changes via the provided ARIA regions, not by reflowing text.
- Keep section spacing generous — `py-24` is a normal vertical rhythm on hero
  and editorial surfaces.

**Don't**

- Introduce gradients. None. Not even subtle ones.
- Use emoji in UI copy. The product is editorial; copy is terse.
- Add new font families. Two is the system.
- Use `shadow-md` or heavier. `shadow-sm` is the ceiling, and even that is
  rare — hairlines do the lifting.
- Apply `shadow-inner` to inputs. The single underline is the indicator.
- Invent new colors, even as one-off CSS vars. Route the request through a
  palette decision first.
- Nest cards inside cards. One hairline layer per surface.

---

## 10. Extending the System

Adding a new component?

1. **Shared or local?** If two or more apps in the monorepo would use it,
   it lives in `@worktime/ui`. Otherwise `frontend/src/components/<domain>/…`.
2. **Compose, don't reinvent.** If you need a confirm dialog, wrap `Modal` +
   `Button`. If you need a KPI tile, wrap `Card` + `Dial` or `Card` + a
   serif numeric.
3. **Props, not classes.** Palette and variant behaviour should be expressed
   through explicit props (`variant`, `tone`, `size`) using `cva`, not through
   consumer-side `className` overrides.
4. **Motion.** Pull from the existing presets in `src/lib/motion.ts`. Don't
   ship bespoke easing unless you are prepared to justify it in PR review.
5. **Tests.** Add React Testing Library coverage in
   `frontend/src/__tests__/`. Dial-style SVG primitives need a render + a11y
   snapshot at minimum.
6. **Playwright.** Anything user-facing needs an e2e reach in `frontend/e2e/`.
7. **Docs.** If the component becomes part of the system, add an entry under
   section 4 or 5 of this file — short, with a single code snippet and a
   props table where relevant.

### Extending a token

If you believe the palette needs a new color, open an RFC before opening the
PR. The answer is almost always "use `sand` with `stone` text" or "use `red`
with a narrower surface area." The five-token constraint is the point.

### Deprecating a component

- Mark the export with `@deprecated` in the TSDoc and leave it for one
  release.
- Grep the monorepo for usages. Migrate them in the same PR as the
  deprecation, or open a follow-up and track it on the board.
- Remove the export, then the file. Never the reverse.

---

## 11. File Map

The canonical locations for everything referenced above:

- **Tokens.** `packages/ui/src/tokens.ts` — `COLORS`, `RADII`, `SPACING`,
  `FONT_FAMILIES`, and their corresponding TypeScript token unions.
- **Primitives.** `packages/ui/src/{button,card,badge,input,dial,scroll-tick}.tsx`.
- **Entry.** `packages/ui/src/index.ts` — the public API surface.
- **Tailwind.** `frontend/tailwind.config.ts` — palette, font vars, editorial
  letter-spacing presets, `hairline*` utilities.
- **Global CSS.** `frontend/src/app/globals.css` — CSS variables, reduced-motion
  override, `focus-ring-coral`, prefers-contrast bumps.
- **Motion presets.** `frontend/src/lib/motion.ts` — `reveal`, `dialSpring`,
  `tapSpring`.
- **Shared scaffolding.** `frontend/src/components/shared/*.tsx` — skip link,
  auth guard, locale switcher, logout, Telegram login.
- **Design system reference.** `frontend/docs/DESIGN_SYSTEM.md` — this file.

---

*Last synchronised with `packages/ui@main` on 2026-04-17. If a primitive in
this document disagrees with the source, the source wins — and this file is
wrong and should be corrected in the same PR.*
