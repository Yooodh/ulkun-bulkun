import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: '울끈불끈',
  description: '울끈불끈 당신의 성장을 기록하세요.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black',
    title: '울끈불끈',
  },
  icons: {
    // 브라우저 파비콘
    icon: '/assets/images/ulkun-bulkun_favicon.png',

    // 아이폰 홈 화면 아이콘
    apple: '/assets/images/ulkun-bulkun_app_logo.png',
  },

  openGraph: {
    title: '울끈불끈',
    description: '울끈불끈 당신의 성장을 기록하세요.',
    url: 'https://ulkunbulkun.vercel.app',
    siteName: '울끈불끈',
    images: [
      {
        url: '/assets/images/ulkun-bulkun_open_graph.png',
        width: 1200,
        height: 630,
        alt: '울끈불끈 로고',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
};
