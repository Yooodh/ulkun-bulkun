import type { Metadata, Viewport } from 'next';

import styles from './layout.module.scss';

import AuthForm from '@/components/AuthForm/AuthForm';

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
    apple: '/assets/images/muscle.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko'>
      <body className={Font.variable}>
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
