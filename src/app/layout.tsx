import { ThemeProvider } from 'next-themes';

import AuthForm from '@/components/AuthForm/AuthForm';
import InstallBanner from '@/components/InstallBanner/InstallBanner';

import NoticeModal from '@/components/shared/NoticeModal/NoticeModal';
import ThemedToaster from '@/components/shared/ThemedToaster/ThemedToaster';
import ThemeColorSync from '@/components/shared/ThemeColorSync/ThemeColorSync';
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
      <head>
        <meta
          name='theme-color'
          content='#f0f7ff'
          media='(prefers-color-scheme: light)'
        />
        <meta
          name='theme-color'
          content='#222f37'
          media='(prefers-color-scheme: dark)'
        />
      </head>
      <body className={Font.variable}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <ThemeColorSync />
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
          <NoticeModal />
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
