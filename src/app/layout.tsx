import { Toaster } from 'sonner';

import AuthForm from '@/components/AuthForm/AuthForm';
import InstallBanner from '@/components/InstallBanner/InstallBanner';

import QueryProvider from '@/providers/QueryProvider';

import '@/styles/globals.scss';
import { Font } from '@/styles/fonts';

import styles from './layout.module.scss';

export { metadata, viewport } from './metadata';

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
        <Toaster
          containerAriaLabel='알림'
          position='top-center'
          richColors
          toastOptions={{
            style: {
              fontFamily: 'var(--font-title)',
              fontSize: '18px',
            },
          }}
        />
      </body>
    </html>
  );
}
