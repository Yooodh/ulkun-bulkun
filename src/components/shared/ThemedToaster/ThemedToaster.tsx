'use client';

import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';

import styles from './ThemedToaster.module.scss';

export default function ThemedToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      containerAriaLabel='알림'
      position='top-center'
      icons={{
        info: null,
        success: null,
        error: null,
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          default: styles.default,
          title: styles.title,
          description: styles.description,
          info: styles.info,
          success: styles.success,
          error: styles.error,
        },
        style: {
          fontFamily: 'var(--font-title)',
        },
      }}
    />
  );
}
