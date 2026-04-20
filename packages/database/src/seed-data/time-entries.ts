import { chance, mulberry32, pick, randFloat, randInt } from './prng';

const REFERENCE_NOW = new Date('2026-04-17T12:00:00.000Z');

export interface TimeEntrySeed {
  projectId: string;
  startedAt: Date;
  endedAt: Date;
  durationSec: number;
  note: string | null;
}

export interface GenerateTimeEntriesArgs {
  projectId: string;
  days: number;
  seed: number;
}

const NOTES: readonly string[] = [
  'Работа над макетами',
  'Правки по комментариям клиента',
  'Созвон с заказчиком',
  'Подготовка презентации',
  'Ресёрч референсов',
  'Сборка прототипа',
  'Проверка гипотез',
  'Созвон по ТЗ',
  'Копирайтинг и редактура',
  'Вёрстка секции',
  'Согласование правок',
  null as unknown as string, // sometimes no note
  null as unknown as string,
];

function startOfDay(daysAgo: number): Date {
  const d = new Date(REFERENCE_NOW);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d;
}

function atOffset(day: Date, hourFloat: number): Date {
  const d = new Date(day);
  const whole = Math.floor(hourFloat);
  const mins = Math.floor((hourFloat - whole) * 60);
  const secs = Math.floor(((hourFloat - whole) * 60 - mins) * 60);
  d.setUTCHours(whole, mins, secs, 0);
  return d;
}

/**
 * Deterministically fabricate 1-3 time entries per active workday for a
 * single project. Entries sit inside 09:00–21:00, last 1–6h, never overlap,
 * and ~35% of days are skipped entirely (days off / other projects).
 */
export function generateTimeEntries(args: GenerateTimeEntriesArgs): TimeEntrySeed[] {
  const { projectId, days, seed } = args;
  const rng = mulberry32(seed);
  const entries: TimeEntrySeed[] = [];

  for (let daysAgo = days; daysAgo >= 1; daysAgo--) {
    const day = startOfDay(daysAgo);
    const dow = day.getUTCDay();
    const isWeekend = dow === 0 || dow === 6;

    // Weekends: mostly skipped, occasional burst of work.
    if (isWeekend && !chance(rng, 0.15)) continue;

    // Random "didn't touch this project today" days.
    if (chance(rng, 0.35)) continue;

    const entryCount = randInt(rng, 1, 3);
    let cursor = 9 + randFloat(rng, 0, 1.5); // start sometime between 09:00 and 10:30

    for (let i = 0; i < entryCount; i++) {
      const durationH = randFloat(rng, 1, 6);
      const start = atOffset(day, cursor);
      const end = atOffset(day, cursor + durationH);

      // Bail out if we'd run past 21:00.
      if (cursor + durationH > 21) break;

      const durationSec = Math.max(60, Math.floor((end.getTime() - start.getTime()) / 1000));

      const note = pick(rng, NOTES);

      entries.push({
        projectId,
        startedAt: start,
        endedAt: end,
        durationSec,
        note: note ?? null,
      });

      // Gap between entries: 15–90 minutes.
      cursor += durationH + randFloat(rng, 0.25, 1.5);
    }
  }

  entries.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
  return entries;
}
