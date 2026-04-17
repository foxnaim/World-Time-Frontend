import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

const CREAM = '#EAE7DC';
const CORAL = '#E07856';

export default function Icon() {
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
          borderRadius: 8,
        }}
      >
        {/* Coral dial */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: CORAL,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'serif',
            fontSize: 18,
            fontWeight: 700,
            color: CREAM,
            lineHeight: 1,
          }}
        >
          W
        </div>
      </div>
    ),
    { ...size },
  );
}
