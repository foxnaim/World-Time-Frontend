# i18n (lightweight)

Cookie-based locale, no URL prefix. The active locale lives in the
`NEXT_LOCALE` cookie (one year, site-wide). We avoid `next-intl` and any
runtime dependency — dictionaries are plain JSON in `messages/*.json`.

## Use in an RSC

```tsx
import { getLocale } from '@/i18n/get-locale';
import { loadMessages } from '@/i18n/messages';
import { createTranslator } from '@/i18n/translator';

export default async function Page() {
  const locale = await getLocale();
  const messages = await loadMessages(locale);
  const t = createTranslator(messages);
  return <h1>{t('hero.title')}</h1>;
}
```

`t` supports dotted keys, `{var}` interpolation, and falls back to the raw
key on miss. For a client component, pass `messages` in as a prop.

## Adding keys

1. Edit `messages/ru.json` and `messages/en.json` — keep keys in lockstep.
2. Reference them with dotted paths: `t('pricing.team.cta')`.

## TODO — follow-up tasks (out of scope for agent 40)

- Wire `<LocaleSwitcher />` (in `components/shared/`) into the marketing
  header. Pass `activeLocale={await getLocale()}` from the server page.
- Replace hard-coded strings in `app/(marketing)/page.tsx` and
  `components/landing/hero.tsx` with `t('...')` calls.
- Dashboard stays Russian-only for the MVP — revisit when dashboard copy
  stabilises.
