/**
 * Re-export shim — the canonical locale switcher now lives in
 * `@/components/shared/locale-switcher`. Kept here so any older imports
 * (`@/i18n/locale-switcher`) keep resolving during the transition.
 */
export { LocaleSwitcher, default } from '@/components/shared/locale-switcher';
