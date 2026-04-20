import { EmployeeRole } from '@prisma/client';
import { EXTETA_OWNER_KEY, LOCUS_OWNER_KEY } from './users';

/**
 * Declarative description of how a single demo company should be populated:
 * the company row itself, its owner, and which of the DEMO_USERS become
 * employees (plus their position / comp model).
 */
export interface DemoCompanySeed {
  slug: string;
  name: string;
  ownerUserKey: string;
  address: string;
  latitude: number;
  longitude: number;
  geofenceRadiusM: number;
  timezone: string;
  workStartHour: number;
  workEndHour: number;
  staff: DemoStaffAssignment[];
}

export interface DemoStaffAssignment {
  userKey: string;
  position: string;
  role: EmployeeRole;
  monthlySalary?: string;
  hourlyRate?: string;
}

/**
 * Both demo companies. The assignments reference DEMO_USERS by the same `key`
 * format ("FirstName::LastName") exported from users.ts so nothing has to be
 * re-declared.
 */
export const DEMO_COMPANIES: DemoCompanySeed[] = [
  {
    slug: 'exteta-demo',
    name: 'Exteta Demo',
    ownerUserKey: EXTETA_OWNER_KEY,
    address: 'Moscow, ул. Тверская, 10',
    latitude: 55.7558,
    longitude: 37.6173,
    geofenceRadiusM: 150,
    timezone: 'Asia/Almaty',
    workStartHour: 9,
    workEndHour: 18,
    staff: [
      {
        userKey: 'Иван::Петров',
        position: 'Founder',
        role: EmployeeRole.OWNER,
        monthlySalary: '300000.00',
      },
      {
        userKey: 'Михаил::Иванов',
        position: 'Art Director',
        role: EmployeeRole.MANAGER,
        monthlySalary: '220000.00',
      },
      {
        userKey: 'Екатерина::Кузнецова',
        position: 'Senior Designer',
        role: EmployeeRole.STAFF,
        monthlySalary: '180000.00',
      },
      {
        userKey: 'Дмитрий::Соколов',
        position: 'UI/UX Designer',
        role: EmployeeRole.STAFF,
        monthlySalary: '150000.00',
      },
      {
        userKey: 'Ольга::Попова',
        position: 'Project Manager',
        role: EmployeeRole.STAFF,
        monthlySalary: '160000.00',
      },
      {
        userKey: 'Алексей::Васильев',
        position: 'Motion Designer',
        role: EmployeeRole.STAFF,
        hourlyRate: '1800.00',
      },
    ],
  },
  {
    slug: 'cafe-locus',
    name: 'Кафе Локус',
    ownerUserKey: LOCUS_OWNER_KEY,
    address: 'Saint Petersburg, Невский проспект, 54',
    latitude: 59.9343,
    longitude: 30.3351,
    geofenceRadiusM: 120,
    timezone: 'Asia/Almaty',
    workStartHour: 7,
    workEndHour: 22,
    staff: [
      {
        userKey: 'Анна::Смирнова',
        position: 'Owner',
        role: EmployeeRole.OWNER,
        monthlySalary: '250000.00',
      },
      {
        userKey: 'Мария::Морозова',
        position: 'Shift Manager',
        role: EmployeeRole.MANAGER,
        monthlySalary: '130000.00',
      },
      {
        userKey: 'Сергей::Волков',
        position: 'Head Barista',
        role: EmployeeRole.STAFF,
        hourlyRate: '700.00',
      },
      {
        userKey: 'Наталья::Зайцева',
        position: 'Barista',
        role: EmployeeRole.STAFF,
        hourlyRate: '600.00',
      },
      {
        userKey: 'Павел::',
        position: 'Cashier',
        role: EmployeeRole.STAFF,
        hourlyRate: '550.00',
      },
      {
        userKey: 'Юлия::Лебедева',
        position: 'Waitress',
        role: EmployeeRole.STAFF,
        hourlyRate: '520.00',
      },
    ],
  },
];
