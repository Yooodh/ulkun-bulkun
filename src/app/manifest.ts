import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '울끈불끈',
    short_name: '울끈불끈',
    description: '울끈불끈 당신의 성장을 기록하세요.',
    start_url: '/',
    display: 'standalone',
    background_color: '#17345C',
    theme_color: '#17345C',
    icons: [
      // 안드로이드 홈 화면 아이콘
      {
        src: '/assets/images/ulkun-bulkun_app_logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      // 스플래시 아이콘
      {
        src: '/assets/images/ulkun-bulkun_logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/assets/images/ulkun-bulkun_logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
