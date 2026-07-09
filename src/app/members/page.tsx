'use client';

import { useEffect, useMemo, useState } from 'react';

import styles from './Members.module.scss';

import UserCard from './components/UserCard/UserCard';

import Pagination from '@/components/shared/Pagination/Pagination';
import Loading from '@/components/shared/Loading/Loading';
import NavBar from '@/components/shared/NavBar/NavBar';
import Button from '@/components/shared/Button/Button';

import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';
import { useMySubscriptions } from '@/hooks/useMySubscriptions';
import { useMySubscribers } from '@/hooks/useMySubscribers';

const PAGE_SIZE = 8;

type FilterType = 'all' | 'subscribed' | 'subscribers';

export default function MembersPage() {
  const { user } = useAuth();

  const { users, loading } = useUsers();
  const { subscribedIds, loading: subsLoading } = useMySubscriptions(user?.id);
  const { subscriberIds, loading: subscribersLoading } = useMySubscribers(
    user?.id,
  );

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filter, setFilter] = useState<FilterType>('all');

  // 로그아웃 시 필터 초기화
  useEffect(() => {
    if (!user) setFilter('all');
  }, [user]);

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

  const filteredUsers = useMemo(() => {
    if (filter === 'subscribed') {
      return sortedUsers.filter((user) => subscribedIds.has(user.id));
    }
    if (filter === 'subscribers') {
      return sortedUsers.filter((u) => subscriberIds.has(u.id));
    }
    return sortedUsers;
  }, [sortedUsers, filter, subscribedIds, subscriberIds]);

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE,
    );
  }, [filteredUsers, currentPage]);

  const handleFilterChange = (next: FilterType) => {
    setFilter(next);
    setCurrentPage(1);
  };

  if (loading || subsLoading || subscribersLoading)
    return <Loading fullHeight={true} message='울끈불끈이들 입장 중!' />;

  return (
    <div className={styles.membersContainer}>
      <NavBar href='/' label='대시보드로 돌아가기' />
      <h1 className={styles.title}>🔥 울끈불끈이들 🔥</h1>

      {user && (
        <div className={styles.filterTabs}>
          <Button
            variant='outline'
            shape='round'
            color='muted'
            active={filter === 'all'}
            onClick={() => handleFilterChange('all')}
          >
            전체보기
          </Button>
          <Button
            variant='outline'
            shape='round'
            active={filter === 'subscribers'}
            onClick={() => handleFilterChange('subscribers')}
          >
            팔로워 {subscriberIds.size}
          </Button>
          <Button
            variant='outline'
            shape='round'
            active={filter === 'subscribed'}
            onClick={() => handleFilterChange('subscribed')}
          >
            팔로잉 {subscribedIds.size}
          </Button>
        </div>
      )}

      <div className={styles.userGrid}>
        {paginatedUsers.map((u) => (
          <UserCard
            key={u.id}
            user={u}
            isSubscribed={subscribedIds.has(u.id)}
          />
        ))}
      </div>

      <Pagination
        totalCount={filteredUsers.length}
        pageSize={PAGE_SIZE}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
