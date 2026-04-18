import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tact — учёт рабочего времени',
    short_name: 'Tact',
    description: 'Tact — ритм рабочего дня через Telegram и QR-коды.',
    start_url: '/',
    display: 'standalone',
    background_color: '#EAE7DC',
    theme_color: '#EAE7DC',
    orientation: 'portrait',
    lang: 'ru',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
