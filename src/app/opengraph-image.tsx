import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'WorkTime — учёт времени через Telegram и QR';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CREAM = '#EAE7DC';
const CORAL = '#E07856';
const STONE = '#2A2A28';

export default async function OpengraphImage() {
  const frauncesFont = await fetch(
    'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&display=swap',
  )
    .then((res) => res.text())
    .then((css) => {
      const match = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:woff2|truetype)'\)/);
      return match ? fetch(match[1]).then((r) => r.arrayBuffer()) : null;
    })
    .catch(() => null);

  const ticks = Array.from({ length: 40 });

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: CREAM,
          padding: '80px 96px',
          position: 'relative',
          fontFamily: 'Fraunces, serif',
        }}
      >
        {/* Coral dial decoration — top-right */}
        <div
          style={{
            position: 'absolute',
            right: -140,
            top: -140,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: CORAL,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 340,
              height: 340,
              borderRadius: '50%',
              background: CREAM,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: 8,
                height: 130,
                background: STONE,
                borderRadius: 4,
                top: 40,
                left: 166,
                transform: 'rotate(35deg)',
                transformOrigin: 'bottom center',
              }}
            />
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: STONE,
              }}
            />
          </div>
        </div>

        {/* Small brand tag */}
        <div
          style={{
            position: 'absolute',
            top: 72,
            left: 96,
            fontSize: 26,
            color: STONE,
            opacity: 0.55,
            letterSpacing: 8,
            textTransform: 'uppercase',
            display: 'flex',
          }}
        >
          WorkTime
        </div>

        {/* Centered title */}
        <div
          style={{
            fontSize: 82,
            fontWeight: 600,
            color: STONE,
            lineHeight: 1.05,
            letterSpacing: -2,
            textAlign: 'center',
            maxWidth: 980,
            display: 'flex',
          }}
        >
          WorkTime — учёт времени через Telegram и QR
        </div>

        {/* Stone tick ruler — bottom */}
        <div
          style={{
            position: 'absolute',
            left: 96,
            right: 96,
            bottom: 64,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: 40,
          }}
        >
          {ticks.map((_, index) => (
            <div
              key={index}
              style={{
                width: 2,
                height: index % 5 === 0 ? 32 : 16,
                background: STONE,
                opacity: index % 5 === 0 ? 0.9 : 0.45,
                borderRadius: 1,
              }}
            />
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: frauncesFont
        ? [
            {
              name: 'Fraunces',
              data: frauncesFont,
              weight: 600,
              style: 'normal',
            },
          ]
        : undefined,
    },
  );
}
