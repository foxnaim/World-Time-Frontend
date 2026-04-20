'use client';

/**
 * Backward-compatibility shim.
 *
 * The original implementation here was a deterministic 21x21 placeholder
 * used while the project ran fully offline. It has been replaced with a
 * real QR encoder backed by the `qrcode` library — see ./qr-code.tsx.
 *
 * This file now simply re-exports the real component under the old name
 * so existing imports (`PseudoQr`) continue to compile. Prefer importing
 * `QrCode` from `./qr-code` in new code.
 */

export { QrCode as PseudoQr } from './qr-code';
export type { QrCodeProps as PseudoQrProps } from './qr-code';
