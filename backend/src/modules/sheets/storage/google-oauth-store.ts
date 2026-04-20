import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * Per-user Google OAuth token store. We use a JSON file instead of a DB
 * column to avoid Prisma schema churn — the token set is small (just
 * refresh_token + cached access_token), and per-user concurrency on a
 * single-node dev server is fine.
 *
 * Refresh tokens do not expire unless the user revokes access or Google
 * rotates them (rare). Access tokens are short-lived (~1h); we refresh
 * on demand.
 */

export interface GoogleOAuthTokens {
  refreshToken: string;
  accessToken: string | null;
  /** epoch ms when the access token expires */
  expiryDate: number | null;
  email: string | null;
  scope: string | null;
  connectedAt: string;
}

interface StoreFile {
  [userId: string]: GoogleOAuthTokens;
}

const STORE_DIR = path.resolve(process.cwd(), '.data');
const STORE_FILE = path.join(STORE_DIR, 'google-oauth.json');

async function ensureDir(): Promise<void> {
  try {
    await fs.mkdir(STORE_DIR, { recursive: true });
  } catch {
    // mkdir -p is idempotent
  }
}

async function readAll(): Promise<StoreFile> {
  try {
    const raw = await fs.readFile(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object') return parsed as StoreFile;
    return {};
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === 'ENOENT') return {};
    return {};
  }
}

export async function get(userId: string): Promise<GoogleOAuthTokens | undefined> {
  const all = await readAll();
  return all[userId];
}

export async function set(userId: string, tokens: GoogleOAuthTokens): Promise<void> {
  await ensureDir();
  const all = await readAll();
  all[userId] = tokens;
  await fs.writeFile(STORE_FILE, JSON.stringify(all, null, 2), 'utf8');
}

export async function remove(userId: string): Promise<void> {
  const all = await readAll();
  if (userId in all) {
    delete all[userId];
    await fs.writeFile(STORE_FILE, JSON.stringify(all, null, 2), 'utf8');
  }
}
