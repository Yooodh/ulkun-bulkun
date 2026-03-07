import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

type RawProfile = {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  status_message: string | null;
};

type RawRecord = {
  user_id: string;
  total_weight: number | null;
  created_at: string;
};

export type UserSummary = {
  id: string;
  nickname: string;
  avatar_url: string;
  status_message: string;
  max_total: number;
  last_activity: string;
};

export function useUsers() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);

        // 프로필 정보 가져오기
        const { data: profiles, error: pError } = await supabase
          .from('profiles')
          .select('id, nickname, avatar_url, status_message');

        if (pError) throw pError;
        const typedProfiles = profiles as RawProfile[];

        // 기록 정보 가져오기
        const { data: records, error: rError } = await supabase
          .from('records')
          .select('user_id, total_weight, created_at');

        if (rError) throw rError;
        const typedRecords = records as RawRecord[];

        // 데이터 조합
        const userList: UserSummary[] = typedProfiles.map((profile) => {
          const userRecords = typedRecords.filter(
            (r) => r.user_id === profile.id,
          );

          const maxTotal =
            userRecords.length > 0
              ? Math.max(...userRecords.map((r) => r.total_weight || 0))
              : 0;

          const lastActivity =
            userRecords.length > 0
              ? [...userRecords].sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
                )[0].created_at
              : '';

          return {
            id: profile.id,
            nickname: profile.nickname || '불끈이',
            avatar_url: profile.avatar_url || '',
            status_message: profile.status_message || '안녕하세요!',
            max_total: maxTotal,
            last_activity: lastActivity,
          };
        });

        // PR 높은 순 정렬
        const sortedList = userList.sort((a, b) => b.max_total - a.max_total);
        setUsers(sortedList);
      } catch (e) {
        const error = e as Error;
        console.error('유저 목록 로드 실패:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return { users, loading };
}
