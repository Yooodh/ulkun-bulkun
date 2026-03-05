import type { Metadata } from 'next';

import styles from './layout.module.scss';

import AuthForm from '@/components/AuthForm/AuthForm';

import '@/styles/globals.scss';
import { Font } from '@/styles/fonts';

export const metadata: Metadata = {
  title: '울끈불끈',
  description: '울끈불끈 당신의 성장을 기록하세요.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko'>
      <body className={Font.variable}>
        <div className={styles.wrapper}>
          <main className={styles.container}>
            <AuthForm />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
