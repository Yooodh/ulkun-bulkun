import Image from 'next/image';

import NavBar from '@/components/shared/NavBar/NavBar';

import styles from './Offline.module.scss';

export default function OfflinePage() {
  return (
    <>
      <NavBar href='/' label='대시보드로 돌아가기' />
      <section className={styles.container}>
        <Image
          src='/assets/images/ulkun-bulkun_logo.png'
          alt='울끈불끈 로고'
          className={styles.image}
          width={1536}
          height={1024}
          priority
        />
        <h1>오프라인 상태예요</h1>
        <p className={styles.description}>
          인터넷 연결을 확인한 후 다시 시도해주세요.
        </p>
      </section>
    </>
  );
}
