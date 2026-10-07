import { ThemeProvider } from 'next-themes';

import AuthForm from '@/components/AuthForm/AuthForm';
import InstallBanner from '@/components/InstallBanner/InstallBanner';
import ThemedToaster from '@/components/shared/ThemedToaster/ThemedToaster';
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
    <html lang='ko' suppressHydrationWarning>
      <body className={Font.variable}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
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
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
