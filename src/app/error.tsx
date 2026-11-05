'use client';

import { useEffect } from 'react';
import Image from 'next/image';

import Button from '@/components/shared/Button/Button';

import styles from './error.module.scss';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className={styles.container}>
      <Image
        src='/assets/images/ulkun-bulkun_logo.png'
        alt='울끈불끈 로고'
        className={styles.image}
        width={1536}
        height={1024}
        priority
      />
      <h1>오류가 발생했어요</h1>
      <p className={styles.description}>
        페이지를 불러오는 중 문제가 발생했어요. 다시 시도해 주세요.
      </p>
      <Button type='button' onClick={reset} className={styles.retryButton}>
        다시 시도
      </Button>
    </main>
  );
}
