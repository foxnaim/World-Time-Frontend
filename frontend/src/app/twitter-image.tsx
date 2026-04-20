import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Work Tact — ритм рабочего дня';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CREAM = '#EAE7DC';
const CORAL = '#E07856';
const STONE = '#2A2A28';

export default async function TwitterImage() {
  const frauncesRegular = await fetch(
    'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&display=swap',
  )
    .then((res) => res.text())
    .then((css) => {
      const match = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:woff2|truetype)'\)/);
      return match ? fetch(match[1]).then((r) => r.arrayBuffer()) : null;
    })
    .catch(() => null);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        background: CREAM,
        padding: '80px 96px',
        position: 'relative',
        fontFamily: 'Fraunces, serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: -120,
          top: -120,
          width: 560,
          height: 560,
          borderRadius: '50%',
          background: CORAL,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: CREAM,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 8,
              height: 150,
              background: STONE,
              borderRadius: 4,
              transform: 'translate(0, -30px) rotate(35deg)',
              transformOrigin: 'bottom center',
            }}
          />
        </div>
      </div>

      <div
        style={{
          fontSize: 28,
          color: STONE,
          opacity: 0.6,
          letterSpacing: 6,
          textTransform: 'uppercase',
          marginBottom: 24,
          display: 'flex',
        }}
      >
        Work Tact
      </div>

      <div
        style={{
          fontSize: 260,
          fontWeight: 600,
          color: STONE,
          lineHeight: 0.95,
          letterSpacing: -8,
          display: 'flex',
        }}
      >
        Work Tact
      </div>

      <div
        style={{
          fontSize: 40,
          color: STONE,
          opacity: 0.78,
          marginTop: 40,
          maxWidth: 820,
          display: 'flex',
        }}
      >
        Ритм рабочего дня · Telegram + QR
      </div>

      <div
        style={{
          position: 'absolute',
          left: 96,
          bottom: 64,
          width: 96,
          height: 6,
          background: CORAL,
          borderRadius: 3,
        }}
      />
    </div>,
    {
      ...size,
      fonts: frauncesRegular
        ? [
            {
              name: 'Fraunces',
              data: frauncesRegular,
              weight: 600,
              style: 'normal',
            },
          ]
        : undefined,
    },
  );
}
