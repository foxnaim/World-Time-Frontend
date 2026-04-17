# Accessibility TODOs (remaining)

Tracked during agent-44 pass. Skip link, visually-hidden primitive,
focus-visible ring, reduced-motion, and prefers-contrast support already shipped
in `layout.tsx` + `globals.css`.

## High priority
- **Modal initial-focus heuristic** — `ui/modal.tsx` focuses the first tabbable
  element, which on most modals is the × close button. Prefer focusing a more
  meaningful landmark (e.g. the heading or a primary action). Requires
  per-modal `initialFocusRef` prop.
- **Focus trap on mobile drawer** — `landing/header.tsx` has no mobile menu
  component yet, but once added it must replicate the modal trap.
- **Dropdown (`ui/dropdown.tsx`)** — not audited this pass; needs roving
  tabindex, ArrowUp/Down navigation, Escape, and `aria-activedescendant`.
- **Toast (`ui/toast.tsx`)** — verify `role="status"` vs `role="alert"` split
  per severity, and `aria-live` region ownership so toasts aren't duplicated
  to SR.

## Medium priority
- **Employees table sorting** — headers need `aria-sort` once sortable columns
  land. The row `…` menu should open on ArrowDown from the trigger and trap
  focus inside the popover until Escape.
- **QR display rotation** — the countdown in the QR aria-label only updates on
  React re-render (10 Hz). Consider throttling SR announcements to every 10 s
  via a separate `role="status"` region to avoid chatter.
- **CodeInput** — `onComplete` should also move focus away (e.g. submit button)
  so SR users know the code is confirmed.
- **Landing sections** — `hero.tsx`, `features.tsx`, `pricing.tsx` not audited;
  confirm heading order (single `h1` per page) and decorative SVGs carry
  `aria-hidden="true"`.

## Low priority / polish
- **Colour contrast** — `text-stone/60` on `bg-cream` is borderline AA for body
  copy; `prefers-contrast: more` already upgrades it, but the default should be
  revisited (target 4.5:1).
- **Lang switcher** — EN/RU buttons flip visual state only; they do not update
  `<html lang>`. Wire to next-intl or add `aria-live` announcement.
- **pseudo-qr / tick-ruler** — decorative, correctly `aria-hidden`. No action.
- **Form errors** — `form-field.tsx` not audited; ensure `aria-describedby`
  links inputs to inline error text.
