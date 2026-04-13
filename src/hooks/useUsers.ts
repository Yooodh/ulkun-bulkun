import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

import { UserSummary, ProfileWithRecords } from '@/types/user';

export function useUsers() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);

        const { data, error } = await supabase.from('profiles').select<
          string,
          ProfileWithRecords
        >(`
            id, 
            nickname, 
            avatar_url, 
            status_message,
            is_public,
            records (
              squat, 
              bench_press, 
              deadlift, 
              total_weight, 
              created_at
            )
          `);

        if (error) throw error;
        if (!data) return;

        const userList: UserSummary[] = data.map((user) => {
          const userRecords = user.records || [];

          const maxSquat = Math.max(...userRecords.map((r) => r.squat ?? 0), 0);
          const maxBench = Math.max(
            ...userRecords.map((r) => r.bench_press ?? 0),
            0,
          );
          const maxDead = Math.max(
            ...userRecords.map((r) => r.deadlift ?? 0),
            0,
          );

          const totalPR = maxSquat + maxBench + maxDead;

          const lastActivity =
            userRecords.length > 0
              ? userRecords
                  .map((r) => r.created_at)
                  .sort(
                    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
                  )[0]
              : '';

          return {
            id: user.id,
            nickname: user.nickname || '울끈불끈이',
            avatar_url: user.avatar_url || '',
            status_message: user.status_message || '울끈불끈!',
            max_squat: maxSquat,
            max_bench: maxBench,
            max_deadlift: maxDead,
            max_total: totalPR,
            last_activity: lastActivity,
            is_public: user.is_public ?? true,
          };
        });

        setUsers(userList);
      } catch (e) {
        console.error('유저 목록 로드 실패:', (e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return { users, loading };
}
