import {
  EmployeeRole,
  EmployeeStatus,
  PrismaClient,
  SubscriptionStatus,
  SubscriptionTier,
} from '@prisma/client';
import { DEMO_COMPANIES } from './seed-data/companies';
import { generateCheckIns } from './seed-data/checkins';
import { DEMO_PROJECTS } from './seed-data/projects';
import { generateTimeEntries } from './seed-data/time-entries';
import { DEMO_USERS, EXTETA_OWNER_KEY } from './seed-data/users';
import { hashString } from './seed-data/prng';

const prisma = new PrismaClient();

/** Number of days of history to fabricate. */
const CHECKIN_DAYS = 30;
const TIME_ENTRY_DAYS = 45;

async function clearDatabase(): Promise<void> {
  // FK-safe order: children first, parents last.
  await prisma.timeEntry.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.checkIn.deleteMany({});
  await prisma.qRToken.deleteMany({});
  await prisma.inviteToken.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.user.deleteMany({});
}

/** Default FREE-tier seat cap — kept in sync with backend TIERS.FREE.seatsLimit. */
const FREE_TIER_SEATS_LIMIT = 5;

/**
 * Ensure every company has a default FREE subscription row. Uses upsert so
 * reseeds don't drift: if a row exists for the company we refresh its period
 * window, otherwise we create a fresh one.
 */
async function seedSubscriptions(
  companiesBySlug: Map<string, SeededCompany>,
): Promise<number> {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  let count = 0;
  for (const company of companiesBySlug.values()) {
    await prisma.subscription.upsert({
      where: { companyId: company.id },
      update: {
        tier: SubscriptionTier.FREE,
        status: SubscriptionStatus.ACTIVE,
        seatsLimit: FREE_TIER_SEATS_LIMIT,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      create: {
        companyId: company.id,
        tier: SubscriptionTier.FREE,
        status: SubscriptionStatus.ACTIVE,
        seatsLimit: FREE_TIER_SEATS_LIMIT,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
    count++;
  }
  return count;
}

async function seedUsers(): Promise<Map<string, string>> {
  const byKey = new Map<string, string>();
  for (const u of DEMO_USERS) {
    const row = await prisma.user.upsert({
      where: { telegramId: u.telegramId },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        username: u.username,
        phone: u.phone,
        avatarUrl: u.avatarUrl,
      },
      create: {
        telegramId: u.telegramId,
        firstName: u.firstName,
        lastName: u.lastName,
        username: u.username,
        phone: u.phone,
        avatarUrl: u.avatarUrl,
      },
    });
    byKey.set(u.key, row.id);
  }
  return byKey;
}

interface SeededCompany {
  id: string;
  slug: string;
  workStartHour: number;
  workEndHour: number;
  latitude: number | null;
  longitude: number | null;
  geofenceRadiusM: number;
}

async function seedCompanies(usersByKey: Map<string, string>): Promise<Map<string, SeededCompany>> {
  const byKey = new Map<string, SeededCompany>();
  for (const c of DEMO_COMPANIES) {
    const ownerId = usersByKey.get(c.ownerUserKey);
    if (!ownerId) throw new Error(`No seeded owner for ${c.slug} (${c.ownerUserKey})`);

    const row = await prisma.company.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        ownerId,
        address: c.address,
        latitude: c.latitude,
        longitude: c.longitude,
        geofenceRadiusM: c.geofenceRadiusM,
        timezone: c.timezone,
        workStartHour: c.workStartHour,
        workEndHour: c.workEndHour,
      },
      create: {
        name: c.name,
        slug: c.slug,
        ownerId,
        address: c.address,
        latitude: c.latitude,
        longitude: c.longitude,
        geofenceRadiusM: c.geofenceRadiusM,
        timezone: c.timezone,
        workStartHour: c.workStartHour,
        workEndHour: c.workEndHour,
      },
    });

    byKey.set(c.slug, {
      id: row.id,
      slug: row.slug,
      workStartHour: row.workStartHour,
      workEndHour: row.workEndHour,
      latitude: row.latitude,
      longitude: row.longitude,
      geofenceRadiusM: row.geofenceRadiusM,
    });
  }
  return byKey;
}

interface SeededEmployee {
  id: string;
  companySlug: string;
  userKey: string;
}

async function seedEmployees(
  usersByKey: Map<string, string>,
  companiesBySlug: Map<string, SeededCompany>,
): Promise<SeededEmployee[]> {
  const employees: SeededEmployee[] = [];
  for (const c of DEMO_COMPANIES) {
    const company = companiesBySlug.get(c.slug);
    if (!company) throw new Error(`Company ${c.slug} missing after upsert`);

    for (const member of c.staff) {
      const userId = usersByKey.get(member.userKey);
      if (!userId) throw new Error(`Missing user ${member.userKey} for ${c.slug}`);

      const emp = await prisma.employee.upsert({
        where: { userId_companyId: { userId, companyId: company.id } },
        update: {
          position: member.position,
          role: member.role,
          status: EmployeeStatus.ACTIVE,
          monthlySalary: member.monthlySalary ?? null,
          hourlyRate: member.hourlyRate ?? null,
        },
        create: {
          userId,
          companyId: company.id,
          position: member.position,
          role: member.role,
          status: EmployeeStatus.ACTIVE,
          monthlySalary: member.monthlySalary ?? null,
          hourlyRate: member.hourlyRate ?? null,
        },
      });
      employees.push({ id: emp.id, companySlug: c.slug, userKey: member.userKey });
    }
  }
  return employees;
}

async function seedCheckIns(
  employees: SeededEmployee[],
  companiesBySlug: Map<string, SeededCompany>,
): Promise<number> {
  let total = 0;
  for (const emp of employees) {
    const company = companiesBySlug.get(emp.companySlug);
    if (!company) continue;
    const rows = generateCheckIns({
      employeeId: emp.id,
      company: {
        workStartHour: company.workStartHour,
        workEndHour: company.workEndHour,
        latitude: company.latitude,
        longitude: company.longitude,
        geofenceRadiusM: company.geofenceRadiusM,
      },
      days: CHECKIN_DAYS,
      seed: hashString(`checkin::${emp.id}::${emp.userKey}`),
    });
    if (rows.length === 0) continue;
    const result = await prisma.checkIn.createMany({ data: rows });
    total += result.count;
  }
  return total;
}

async function seedProjectsAndTimeEntries(
  usersByKey: Map<string, string>,
): Promise<{ projects: number; entries: number }> {
  const ownerId = usersByKey.get(EXTETA_OWNER_KEY);
  if (!ownerId) throw new Error('Exteta owner missing — cannot seed projects');

  let projectCount = 0;
  let entryCount = 0;

  for (const p of DEMO_PROJECTS) {
    // No natural unique key on Project (userId+name isn't unique in schema),
    // so we do a find-first / upsert-by-id dance.
    const existing = await prisma.project.findFirst({
      where: { userId: ownerId, name: p.name },
    });

    const project = existing
      ? await prisma.project.update({
          where: { id: existing.id },
          data: {
            description: p.description,
            hourlyRate: p.hourlyRate,
            fixedPrice: p.fixedPrice,
            currency: p.currency,
            status: p.status,
          },
        })
      : await prisma.project.create({
          data: {
            userId: ownerId,
            name: p.name,
            description: p.description,
            hourlyRate: p.hourlyRate,
            fixedPrice: p.fixedPrice,
            currency: p.currency,
            status: p.status,
          },
        });
    projectCount++;

    // Wipe existing entries for this project so reseeds stay idempotent
    // rather than accumulating duplicates.
    await prisma.timeEntry.deleteMany({ where: { projectId: project.id } });

    const entries = generateTimeEntries({
      projectId: project.id,
      days: TIME_ENTRY_DAYS,
      seed: hashString(`time::${project.id}::${p.name}`),
    });
    if (entries.length > 0) {
      const res = await prisma.timeEntry.createMany({ data: entries });
      entryCount += res.count;
    }
  }

  return { projects: projectCount, entries: entryCount };
}

async function main(): Promise<void> {
  console.log('Seeding database (deterministic demo data)...');

  console.log('  - clearing existing rows');
  await clearDatabase();

  console.log('  - upserting users');
  const usersByKey = await seedUsers();

  console.log('  - upserting companies');
  const companiesBySlug = await seedCompanies(usersByKey);

  console.log('  - upserting default FREE subscriptions');
  const subscriptionCount = await seedSubscriptions(companiesBySlug);

  console.log('  - upserting employees');
  const employees = await seedEmployees(usersByKey, companiesBySlug);

  console.log('  - generating check-ins');
  const checkInCount = await seedCheckIns(employees, companiesBySlug);

  console.log('  - upserting projects & time entries');
  const { projects: projectCount, entries: entryCount } =
    await seedProjectsAndTimeEntries(usersByKey);

  // Sanity log: how many OWNERs per company? Good smoke-test for the role mapping.
  const ownerCount = employees.filter((e) =>
    DEMO_COMPANIES.some((c) =>
      c.staff.some(
        (s) => s.userKey === e.userKey && c.slug === e.companySlug && s.role === EmployeeRole.OWNER,
      ),
    ),
  ).length;

  console.log('');
  console.log('Seed complete:');
  console.log(`  users         : ${usersByKey.size}`);
  console.log(`  companies     : ${companiesBySlug.size}`);
  console.log(`  subscriptions : ${subscriptionCount} (FREE)`);
  console.log(`  employees     : ${employees.length} (owners: ${ownerCount})`);
  console.log(`  check-ins     : ${checkInCount} across ${CHECKIN_DAYS} days`);
  console.log(`  projects      : ${projectCount}`);
  console.log(`  time entries  : ${entryCount} across ${TIME_ENTRY_DAYS} days`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
