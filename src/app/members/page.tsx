'use client';

import { useMemo } from 'react';

import styles from './Members.module.scss';

import UserCard from './components/UserCard/UserCard';

import Loading from '@/components/shared/Loading/Loading';
import NavBar from '@/components/shared/NavBar/NavBar';

import { useUsers } from '@/hooks/useUsers';

export default function MembersPage() {
  const { users, loading } = useUsers();

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (a.is_public !== b.is_public) return a.is_public ? -1 : 1;

      const totalA =
        (a.max_squat || 0) + (a.max_bench || 0) + (a.max_deadlift || 0);
      const totalB =
        (b.max_squat || 0) + (b.max_bench || 0) + (b.max_deadlift || 0);

      const finalA = totalA || a.max_total || 0;
      const finalB = totalB || b.max_total || 0;

      return finalB - finalA;
    });
  }, [users]);

  if (loading)
    return <Loading fullHeight={true} message='울끈불끈이들 입장 중!' />;

  return (
    <div className={styles.membersContainer}>
      <NavBar href='/' label='대시보드로 돌아가기' />
      <h1 className={styles.title}>🔥 울끈불끈이들 🔥</h1>

      <div className={styles.userGrid}>
        {sortedUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}
