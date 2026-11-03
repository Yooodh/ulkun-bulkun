import Image from 'next/image';

import NavBar from '@/components/shared/NavBar/NavBar';

import styles from './not-found.module.scss';

export default function MemberNotFound() {
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
        <h1>프로필을 찾을 수 없어요</h1>
        <p className={styles.description}>
          주소를 확인하거나 멤버 목록에서 다시 찾아주세요.
        </p>
      </section>
    </>
  );
}
