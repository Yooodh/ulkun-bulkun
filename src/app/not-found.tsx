import Image from 'next/image';

import NavBar from '@/components/shared/NavBar/NavBar';

import styles from './not-found.module.scss';

export default function NotFound() {
  return (
    <>
      <NavBar href='/' label='대시보드로 돌아가기' />
      <section className={styles.container}>
        <Image
          src='/assets/images/ulkun-bulkun_404.png'
          alt='404'
          className={styles.image}
          width={1536}
          height={1024}
          priority
        />
        <h1>페이지를 찾을 수 없어요</h1>
        <p className={styles.description}>
          주소가 잘못되었거나 페이지가 이동 또는 삭제되었을 수 있어요.
        </p>
      </section>
    </>
  );
}
