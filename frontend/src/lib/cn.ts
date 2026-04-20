import { clsx, type ClassValue } from 'clsx';

/**
 * Compose className strings with the ergonomics of clsx.
 * Kept separate from UI package so web app can import without cycle risk.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
