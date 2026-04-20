import { CheckInType } from '@prisma/client';
import { chance, mulberry32, randFloat } from './prng';

/** Stable reference point so check-ins never drift when the wall clock moves. */
const REFERENCE_NOW = new Date('2026-04-17T12:00:00.000Z');

export interface CheckInSeed {
  employeeId: string;
  type: CheckInType;
  timestamp: Date;
  latitude: number | null;
  longitude: number | null;
}

export interface GenerateCheckInsArgs {
  employeeId: string;
  company: {
    workStartHour: number;
    workEndHour: number;
    latitude: number | null;
    longitude: number | null;
    geofenceRadiusM: number;
  };
  days: number;
  seed: number;
}

/**
 * Build a Date at a given local hour on `daysAgo` days before the reference
 * timestamp. We intentionally treat hours as "company local" but render them
 * as UTC — the reference anchor keeps everything deterministic regardless of
 * the host timezone.
 */
function atHour(daysAgo: number, hourFloat: number): Date {
  const d = new Date(REFERENCE_NOW);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  const whole = Math.floor(hourFloat);
  const mins = Math.floor((hourFloat - whole) * 60);
  const secs = Math.floor(((hourFloat - whole) * 60 - mins) * 60);
  d.setUTCHours(whole, mins, secs, 0);
  return d;
}

/**
 * Tiny lat/lon jitter inside (roughly) the company's geofence. 1 degree of lat
 * is ~111_320m, so scaling `radiusM / 111320` keeps us within the circle with
 * room to spare.
 */
function jitterCoord(
  rng: () => number,
  base: number | null,
  radiusM: number,
  axis: 'lat' | 'lon',
): number | null {
  if (base === null) return null;
  const deg = radiusM / (axis === 'lat' ? 111_320 : 70_000);
  return base + randFloat(rng, -deg, deg);
}

/**
 * Deterministically generate IN/OUT pairs for a single employee across the
 * last `days` days. Output is sorted by timestamp ascending.
 *
 * - IN lands at ~workStartHour with gaussian-ish noise (sometimes late).
 * - OUT lands at ~workEndHour with a similar but independent jitter.
 * - Weekends (Sat/Sun) are skipped by default.
 * - ~12% of workdays are dropped to simulate sick leave / days off.
 * - ~18% of days the IN is noticeably late (> +25min).
 */
export function generateCheckIns(args: GenerateCheckInsArgs): CheckInSeed[] {
  const { employeeId, company, days, seed } = args;
  const rng = mulberry32(seed);
  const out: CheckInSeed[] = [];

  for (let daysAgo = days; daysAgo >= 1; daysAgo--) {
    const dayDate = new Date(REFERENCE_NOW);
    dayDate.setUTCDate(dayDate.getUTCDate() - daysAgo);
    const dow = dayDate.getUTCDay(); // 0 = Sun, 6 = Sat
    const isWeekend = dow === 0 || dow === 6;

    // Weekends: most shops close but a coffee shop (longer workEndHour) keeps
    // a weekend skeleton crew — keep ~40% of weekend days for those.
    if (isWeekend) {
      const longHours = company.workEndHour - company.workStartHour >= 12;
      if (!longHours) continue;
      if (!chance(rng, 0.4)) continue;
    }

    // Sick / personal day.
    if (chance(rng, 0.12)) continue;

    // Maybe a known-late day.
    const lateDay = chance(rng, 0.18);
    const inNoiseMin = lateDay ? randFloat(rng, 25, 75) : randFloat(rng, -15, 20);
    const outNoiseMin = randFloat(rng, -30, 45);

    const inHour = company.workStartHour + inNoiseMin / 60;
    const outHour = company.workEndHour + outNoiseMin / 60;

    const inTs = atHour(daysAgo, inHour);
    const outTs = atHour(daysAgo, outHour);

    out.push({
      employeeId,
      type: CheckInType.IN,
      timestamp: inTs,
      latitude: jitterCoord(rng, company.latitude, company.geofenceRadiusM, 'lat'),
      longitude: jitterCoord(rng, company.longitude, company.geofenceRadiusM, 'lon'),
    });

    // Rarely forget to punch out.
    if (chance(rng, 0.05)) continue;

    out.push({
      employeeId,
      type: CheckInType.OUT,
      timestamp: outTs,
      latitude: jitterCoord(rng, company.latitude, company.geofenceRadiusM, 'lat'),
      longitude: jitterCoord(rng, company.longitude, company.geofenceRadiusM, 'lon'),
    });
  }

  out.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  return out;
}
