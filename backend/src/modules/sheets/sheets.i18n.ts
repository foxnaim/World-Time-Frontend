/**
 * Sheets export localization.
 *
 * Headers and tab titles are picked from the user's chosen locale,
 * defaulting to Russian. The frontend forwards the user's `NEXT_LOCALE`
 * cookie (or an explicit `x-locale` header) so we can resolve it here
 * without a DB round-trip.
 */

export type Locale = 'ru' | 'en' | 'kz';

export const DEFAULT_LOCALE: Locale = 'ru';

export function normalizeLocale(v: string | undefined | null): Locale {
  if (v === 'ru' || v === 'en' || v === 'kz') return v;
  return DEFAULT_LOCALE;
}

interface Dict {
  attendanceSheet: string;
  summarySheet: string;
  attendanceHeaders: string[];
  summaryHeaders: string[];
  typeIn: string;
  typeOut: string;
}

export const SHEETS_I18N: Record<Locale, Dict> = {
  ru: {
    attendanceSheet: 'Посещаемость',
    summarySheet: 'Сводка',
    attendanceHeaders: [
      'Дата',
      'Сотрудник',
      'Должность',
      'Тип',
      'Время',
      'Опоздание',
      'Опоздание (мин)',
      'Широта',
      'Долгота',
    ],
    summaryHeaders: [
      'Сотрудник',
      'Должность',
      'Отработано часов',
      'Кол-во опозданий',
      'Всего опозданий (мин)',
      'Переработка (ч)',
      'Оклад',
      'К выплате',
    ],
    typeIn: 'Приход',
    typeOut: 'Уход',
  },
  en: {
    attendanceSheet: 'Attendance',
    summarySheet: 'Summary',
    attendanceHeaders: [
      'Date',
      'Employee',
      'Position',
      'Type',
      'Time',
      'Late',
      'Late (min)',
      'Latitude',
      'Longitude',
    ],
    summaryHeaders: [
      'Employee',
      'Position',
      'Worked Hours',
      'Late Count',
      'Total Late (min)',
      'Overtime Hours',
      'Monthly Salary',
      'Final Payout',
    ],
    typeIn: 'Check-in',
    typeOut: 'Check-out',
  },
  kz: {
    attendanceSheet: 'Қатысу',
    summarySheet: 'Қорытынды',
    attendanceHeaders: [
      'Күні',
      'Қызметкер',
      'Лауазым',
      'Түрі',
      'Уақыт',
      'Кешігу',
      'Кешігу (мин)',
      'Ендік',
      'Бойлық',
    ],
    summaryHeaders: [
      'Қызметкер',
      'Лауазым',
      'Жұмыс уақыты (сағ)',
      'Кешігу саны',
      'Барлық кешігу (мин)',
      'Қосымша (сағ)',
      'Айлық жалақы',
      'Төлемге',
    ],
    typeIn: 'Кіру',
    typeOut: 'Шығу',
  },
};
