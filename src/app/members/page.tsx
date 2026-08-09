'use client';

import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/shared/Button/Button';
import Empty from '@/components/shared/Empty/Empty';
import Loading from '@/components/shared/Loading/Loading';
import NavBar from '@/components/shared/NavBar/NavBar';
import Pagination from '@/components/shared/Pagination/Pagination';

import { useAuth } from '@/hooks/useAuth';
import { useMySubscribers } from '@/hooks/useMySubscribers';
import { useMySubscriptions } from '@/hooks/useMySubscriptions';
import { useUsers } from '@/hooks/useUsers';

import { UserSummary } from '@/types/user';

import UserCard from './components/UserCard/UserCard';

import styles from './Members.module.scss';

const GENDER_GROUP_PAGE_SIZE = 4;

type FilterType = 'all' | 'subscribed' | 'subscribers';
type GenderGroupKey = 'male' | 'female' | 'unknown';

const GENDER_GROUPS: { key: GenderGroupKey; label: string }[] = [
  { key: 'male', label: '남성' },
  { key: 'female', label: '여성' },
  { key: 'unknown', label: '미설정' },
];

function getGenderGroup(user: UserSummary): GenderGroupKey {
  if (user.gender === 'male') return 'male';
  if (user.gender === 'female') return 'female';
  return 'unknown';
}

export default function MembersPage() {
  const { user } = useAuth();

  const { users, loading } = useUsers();
  const { subscribedIds, loading: subsLoading } = useMySubscriptions(user?.id);
  const { subscriberIds, loading: subscribersLoading } = useMySubscribers(
    user?.id,
  );

  const [filter, setFilter] = useState<FilterType>('all');

  // 그룹별 독립 페이지 상태
  const [groupPages, setGroupPages] = useState<Record<GenderGroupKey, number>>({
    male: 1,
    female: 1,
    unknown: 1,
  });

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

  // 성별 분류
  const groupedUsers = useMemo(() => {
    const groups: Record<GenderGroupKey, UserSummary[]> = {
      male: [],
      female: [],
      unknown: [],
    };
    filteredUsers.forEach((u) => {
      groups[getGenderGroup(u)].push(u);
    });
    return groups;
  }, [filteredUsers]);

  // 필터 변경 시 그룹 페이지 초기화
  const handleFilterChange = (next: FilterType) => {
    setFilter(next);
    setGroupPages({ male: 1, female: 1, unknown: 1 });
  };

  const handleGroupPageChange = (key: GenderGroupKey, page: number) => {
    setGroupPages((prev) => ({ ...prev, [key]: page }));
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

      {filteredUsers.length === 0 ? (
        <Empty message='표시할 멤버가 없어요.' />
      ) : (
        <div className={styles.genderSections}>
          {GENDER_GROUPS.map(({ key, label }) => {
            const groupList = groupedUsers[key];
            if (groupList.length === 0) return null;

            const currentPage = groupPages[key];
            const paginated = groupList.slice(
              (currentPage - 1) * GENDER_GROUP_PAGE_SIZE,
              currentPage * GENDER_GROUP_PAGE_SIZE,
            );

            return (
              <section key={key} className={styles.genderSection}>
                <h2 className={styles.genderSectionTitle}>
                  {label} <span>{groupList.length}</span>
                </h2>

                <div className={styles.userRow}>
                  {paginated.map((u) => (
                    <UserCard
                      key={u.id}
                      user={u}
                      isSubscribed={subscribedIds.has(u.id)}
                    />
                  ))}
                </div>

                {groupList.length > GENDER_GROUP_PAGE_SIZE && (
                  <Pagination
                    totalCount={groupList.length}
                    pageSize={GENDER_GROUP_PAGE_SIZE}
                    currentPage={currentPage}
                    onPageChange={(page) => handleGroupPageChange(key, page)}
                  />
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
