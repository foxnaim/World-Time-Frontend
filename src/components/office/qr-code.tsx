'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';

/**
 * Real QR code renderer backed by the `qrcode` library.
 *
 * Generates an SVG string via `QRCode.toString` on the client and injects
 * it into a wrapper <div role="img">. An SVG keeps the QR crisp at any
 * display size — important on the permanently-mounted office tablet where
 * this lives full-screen — and renders on a transparent light channel so
 * the host chrome shows through.
 *
 * Safety note: the `qrcode` library emits a fixed, well-formed SVG with
 * <svg>, <path>, and <rect> elements only — no <script>, <foreignObject>,
 * or event handlers — so passing its output to `dangerouslySetInnerHTML`
 * is safe. The element `value` is never injected as markup; it is only
 * encoded into the QR payload and echoed back through the aria-label.
 *
 * While the encoder is running (the first tick, and any time the
 * inputs change) we render a faint 21x21 placeholder grid so the layout
 * never collapses — the real QR fades in on top.
 */

export type QrErrorLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrCodeProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  className?: string;
  errorLevel?: QrErrorLevel;
}

const DEFAULT_SIZE = 600;
const DEFAULT_BG = '#EAE7DC';
const DEFAULT_FG = '#1a1a1a';
const DEFAULT_ECL: QrErrorLevel = 'M';

/**
 * Build the option object once per (value, size, ecl, bg, fg) tuple so a
 * parent re-render with identical props does not retrigger the encoder.
 * We keep the `light` channel fully transparent on top of the explicit
 * `bgColor` wrapper — that way the encoded modules are opaque on any bg.
 */
function useEncodeOptions(
  size: number,
  errorLevel: QrErrorLevel,
  fgColor: string,
) {
  return useMemo(
    () => ({
      type: 'svg' as const,
      errorCorrectionLevel: errorLevel,
      margin: 1,
      width: size,
      color: {
        dark: fgColor,
        // 8-digit hex — last two digits are alpha; "00" = fully transparent.
        light: '#00000000',
      },
    }),
    [size, errorLevel, fgColor],
  );
}

function PlaceholderGrid({
  size,
  bgColor,
  fgColor,
}: {
  size: number;
  bgColor: string;
  fgColor: string;
}) {
  // A 21x21 grid matches the smallest QR version and is visually close
  // enough to the real thing to not cause a layout jolt when it resolves.
  const cells = useMemo(() => {
    const arr: boolean[] = [];
    // Deterministic pseudo-random from position: avoids SSR hydration drift.
    for (let i = 0; i < 21 * 21; i += 1) {
      arr.push(((i * 1103515245 + 12345) & 0x40000000) !== 0);
    }
    return arr;
  }, []);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 21 21"
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{ opacity: 0.08, background: bgColor, display: 'block' }}
    >
      {cells.map((on, i) => {
        if (!on) return null;
        const x = i % 21;
        const y = Math.floor(i / 21);
        return <rect key={i} x={x} y={y} width={1} height={1} fill={fgColor} />;
      })}
    </svg>
  );
}

function QrCodeImpl({
  value,
  size = DEFAULT_SIZE,
  bgColor = DEFAULT_BG,
  fgColor = DEFAULT_FG,
  className,
  errorLevel = DEFAULT_ECL,
}: QrCodeProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const options = useEncodeOptions(size, errorLevel, fgColor);

  useEffect(() => {
    let cancelled = false;
    // Reset state when inputs change so the placeholder grid shows again
    // instead of the stale previous QR.
    setSvg(null);
    setError(null);

    // `qrcode` rejects on empty input; we substitute a single space so the
    // component still has something to render during bootstrap.
    QRCode.toString(value || ' ', options)
      .then((out: string) => {
        if (cancelled) return;
        setSvg(out);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : 'QR generation failed';
        setError(message);
      });

    return () => {
      cancelled = true;
    };
  }, [value, options]);

  const wrapperStyle: React.CSSProperties = {
    width: size,
    height: size,
    display: 'inline-block',
    lineHeight: 0,
    background: bgColor,
    position: 'relative',
  };

  if (error) {
    return (
      <div
        className={className}
        role="img"
        aria-label="QR generation error"
        style={{
          ...wrapperStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: fgColor,
          fontSize: 14,
          textAlign: 'center',
          padding: 16,
        }}
      >
        <span>Не удалось сгенерировать QR-код</span>
      </div>
    );
  }

  if (!svg) {
    return (
      <div
        className={className}
        role="img"
        aria-label="QR code loading"
        aria-busy="true"
        style={wrapperStyle}
      >
        <PlaceholderGrid size={size} bgColor={bgColor} fgColor={fgColor} />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`QR: ${value}`}
      className={className}
      style={wrapperStyle}
      // The qrcode library emits a sanitized <svg> (no scripts/handlers);
      // see component JSDoc for the safety rationale.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/**
 * Memoized so a parent re-render with unchanged props does not bounce the
 * encoder effect. React.memo's default shallow equality is sufficient —
 * our props are primitives and stable strings.
 */
export const QrCode = memo(QrCodeImpl);
QrCode.displayName = 'QrCode';
