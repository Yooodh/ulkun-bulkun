import type { Metadata, Viewport } from 'next';

import styles from './layout.module.scss';

import AuthForm from '@/components/AuthForm/AuthForm';
import InstallBanner from '@/components/InstallBanner/InstallBanner';

import '@/styles/globals.scss';
import { Font } from '@/styles/fonts';

import QueryProvider from '@/providers/QueryProvider';

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: '울끈불끈',
  description: '울끈불끈 당신의 성장을 기록하세요.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '울끈불끈',
  },
  icons: {
    icon: '/assets/images/muscle.png',
    apple: '/assets/images/muscle.png',
  },

  openGraph: {
    title: '울끈불끈',
    description: '울끈불끈 당신의 성장을 기록하세요.',
    url: 'https://ulkunbulkun.vercel.app',
    siteName: '울끈불끈',
    images: [
      {
        url: '/assets/images/muscle_full_open_graph.png',
        width: 1200,
        height: 630,
        alt: '울끈불끈 로고',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ko'>
      <body className={Font.variable}>
        <InstallBanner />
        <QueryProvider>
          <div className={styles.wrapper}>
            <main className={styles.container}>
              <AuthForm />
              {children}
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
