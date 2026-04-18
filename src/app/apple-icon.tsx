import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const CREAM = '#EAE7DC';
const CORAL = '#E07856';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: CREAM,
          borderRadius: 40,
        }}
      >
        {/* Coral dial */}
        <div
          style={{
            width: 148,
            height: 148,
            borderRadius: '50%',
            background: CORAL,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Fraunces', 'Times New Roman', serif",
            fontSize: 108,
            fontWeight: 600,
            color: CREAM,
            lineHeight: 1,
            letterSpacing: -3,
          }}
        >
          T
        </div>
      </div>
    ),
    { ...size },
  );
}
