'use client';

import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

import { UserSummary, ProfileWithRecords } from '@/types/user';

async function fetchUsers(): Promise<UserSummary[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select<string, ProfileWithRecords>(
      `
    id, 
    nickname, 
    avatar_url, 
    status_message,
    is_public,
    records (
      squat, 
      bench_press, 
      deadlift, 
      created_at,
      recorded_at,
      status
    )
  `,
    )
    .eq('records.status', 'completed');

  if (error) throw error;
  if (!data) return [];

  return data.map((user) => {
    const userRecords = user.records || [];

    const stats = userRecords.reduce(
      (acc, r) => {
        const currentS = r.squat ?? 0;
        const currentB = r.bench_press ?? 0;
        const currentD = r.deadlift ?? 0;
        const currentDate = (r.recorded_at || r.created_at).split('T')[0];

        return {
          maxS: Math.max(acc.maxS, currentS),
          maxB: Math.max(acc.maxB, currentB),
          maxD: Math.max(acc.maxD, currentD),
          lastDate: currentDate > acc.lastDate ? currentDate : acc.lastDate,
        };
      },
      { maxS: 0, maxB: 0, maxD: 0, lastDate: '' },
    );

    return {
      id: user.id,
      nickname: user.nickname || '울끈불끈이',
      avatar_url: user.avatar_url || '',
      status_message: user.status_message || '울끈불끈!',
      max_squat: stats.maxS,
      max_bench: stats.maxB,
      max_deadlift: stats.maxD,
      max_total: stats.maxS + stats.maxB + stats.maxD,
      last_activity: stats.lastDate,
      is_public: user.is_public ?? true,
    };
  });
}

export function useUsers() {
  const query = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5,
  });

  return {
    users: query.data || [],
    loading: query.isLoading,
    error: query.error,
  };
}
