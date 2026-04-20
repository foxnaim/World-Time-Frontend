import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __worktimePrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__worktimePrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__worktimePrisma = prisma;
}

export default prisma;
export * from '@prisma/client';
