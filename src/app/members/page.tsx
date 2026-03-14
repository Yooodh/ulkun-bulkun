'use client';

import styles from './Members.module.scss';

import NavBar from '@/components/shared/NavBar/NavBar';

export default function MembersPage() {
  return (
    <div className={styles.membersContainer}>
      <NavBar href='/' label='대시보드로 돌아가기' />

      <h1 className={styles.title}>🔥 울끈불끈이들 🔥</h1>
    </div>
  );
}
