'use client';

import Link from 'next/link';
import Image from 'next/image';

import styles from './Members.module.scss';

import Loading from '@/components/shared/Loading/Loading';
import NavBar from '@/components/shared/NavBar/NavBar';

import { useUsers } from '@/hooks/useUsers';

import { formatDate } from '@/utils/dateUtils';

export default function MembersPage() {
  const { users, loading } = useUsers();

  if (loading)
    return <Loading fullHeight={true} message='울끈불끈이들 입장 중!' />;

  return (
    <div className={styles.membersContainer}>
      <NavBar href='/' label='대시보드로 돌아가기' />

      <h1 className={styles.title}>🔥 울끈불끈이들 🔥</h1>

      <div className={styles.userGrid}>
        {users.map((user) => (
          <Link
            href={`/members/${user.id}`}
            key={user.id}
            className={styles.userCard}
          >
            <div className={styles.avatarWrapper}>
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.nickname}
                  width={50}
                  height={50}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.defaultAvatar}>💪</div>
              )}
            </div>
            <div className={styles.userInfo}>
              <p className={styles.statusMessage}>{user.status_message}</p>

              <h3 className={styles.userName}>{user.nickname}</h3>

              <p className={styles.userStats}>
                PR{' '}
                <span>
                  {user.max_total && user.max_total > 0
                    ? `${user.max_total}kg`
                    : '기록 없음'}
                </span>
              </p>

              <p className={styles.date}>
                마지막 기록{''}
                <span> {formatDate(user.last_activity)}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
