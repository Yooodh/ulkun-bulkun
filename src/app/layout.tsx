import { Toaster } from 'sonner';

import AuthForm from '@/components/AuthForm/AuthForm';
import InstallBanner from '@/components/InstallBanner/InstallBanner';
import ScrollToTopButton from '@/components/shared/ScrollToTopButton/ScrollToTopButton';

import QueryProvider from '@/providers/QueryProvider';

import '@/styles/globals.scss';
import { Font } from '@/styles/fonts';

export { metadata, viewport } from './metadata';

import styles from './layout.module.scss';

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
            <ScrollToTopButton />
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
