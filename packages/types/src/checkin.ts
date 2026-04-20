import { z } from 'zod';
import { CheckInTypeSchema } from './enums.js';

/**
 * Submitted by the client after scanning a rotating office QR code.
 * Lat/long are optional — if present, backend performs geofence validation.
 */
export const ScanQrDtoSchema = z.object({
  token: z.string().min(1, 'token is required'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});
export type ScanQrDto = z.infer<typeof ScanQrDtoSchema>;

export const CheckInResponseSchema = z.object({
  id: z.string().uuid(),
  type: CheckInTypeSchema,
  timestamp: z.string().datetime(),
  isLate: z.boolean(),
  lateMinutes: z.number().int().nonnegative().nullable().optional(),
});
export type CheckInResponse = z.infer<typeof CheckInResponseSchema>;

/** Payload rendered on the office display / admin screen. */
export const QRTokenDisplaySchema = z.object({
  token: z.string().min(1),
  expiresAt: z.string().datetime(),
  rotationInSec: z.number().int().positive(),
});
export type QRTokenDisplay = z.infer<typeof QRTokenDisplaySchema>;
