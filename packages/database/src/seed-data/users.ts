import { hashBigIntId } from './prng';

/**
 * Input shape for a seeded demo user. `telegramId` is derived deterministically
 * from the combination of first + last name so reseeding never produces a new
 * id for the same person.
 */
export interface DemoUserSeed {
  key: string;
  telegramId: bigint;
  firstName: string;
  lastName: string | null;
  username: string | null;
  phone: string | null;
  avatarUrl: string | null;
}

function mk(
  firstName: string,
  lastName: string | null,
  username: string | null,
  phone: string | null,
  avatarUrl: string | null,
): DemoUserSeed {
  const key = `${firstName}::${lastName ?? ''}`;
  return {
    key,
    telegramId: hashBigIntId(key),
    firstName,
    lastName,
    username,
    phone,
    avatarUrl,
  };
}

/**
 * 12 demo users with Russian names. Nulls are sprinkled through username /
 * lastName / avatarUrl / phone to mirror how real Telegram accounts present
 * themselves (some users hide their phone, some use one-word handles, etc.).
 */
export const DEMO_USERS: DemoUserSeed[] = [
  mk('Иван', 'Петров', 'ivan_petrov', '+79031110001', 'https://i.pravatar.cc/150?img=12'),
  mk('Анна', 'Смирнова', 'anna_s', '+79031110002', 'https://i.pravatar.cc/150?img=47'),
  mk('Михаил', 'Иванов', 'mikhail', null, 'https://i.pravatar.cc/150?img=15'),
  mk('Екатерина', 'Кузнецова', 'kate_k', '+79031110004', null),
  mk('Дмитрий', 'Соколов', null, '+79031110005', 'https://i.pravatar.cc/150?img=33'),
  mk('Ольга', 'Попова', 'olga_popova', null, 'https://i.pravatar.cc/150?img=49'),
  mk('Алексей', 'Васильев', 'alex_v', '+79031110007', null),
  mk('Мария', 'Морозова', 'maria_m', '+79031110008', 'https://i.pravatar.cc/150?img=48'),
  mk('Сергей', 'Волков', null, '+79031110009', null),
  mk('Наталья', 'Зайцева', 'nat_z', '+79031110010', 'https://i.pravatar.cc/150?img=44'),
  mk('Павел', null, 'pavel', null, null),
  mk('Юлия', 'Лебедева', 'yulia_l', '+79031110012', 'https://i.pravatar.cc/150?img=45'),
];

/** Key of the user who owns the "Exteta Demo" design studio. */
export const EXTETA_OWNER_KEY = DEMO_USERS[0]!.key;

/** Key of the user who owns "Кафе Локус". */
export const LOCUS_OWNER_KEY = DEMO_USERS[1]!.key;
