import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '울끈불끈',
    short_name: '울끈불끈',
    description: '울끈불끈 당신의 성장을 기록하세요.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/assets/images/muscle.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/assets/images/muscle.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
