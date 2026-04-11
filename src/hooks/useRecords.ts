'use client';

import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

import { StrengthRecord } from '@/types/record';

export function useRecords(userId: string | null | undefined = null) {
  // 데이터 페칭
  const query = useQuery({
    queryKey: ['records', userId],
    queryFn: async (): Promise<StrengthRecord[]> => {
      let targetId = userId;

      // userId가 인자로 안 들어왔다면 현재 로그인한 유저 ID 확인
      if (!targetId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        targetId = user?.id || null;
      }

      if (!targetId) return [];

      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', targetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as StrengthRecord[]) || [];
    },
    // userId가 있거나 인자가 없을 때만 실행
    enabled: true,
    staleTime: 1000 * 60 * 5,
  });

  // 삭제
  const deleteRecord = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('records').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error((e as Error).message);
      return false;
    }
  };

  // 날짜 수정
  const updateRecordDate = async (
    id: string,
    editDate: string,
  ): Promise<boolean> => {
    if (!editDate || !query.data) return false;

    try {
      const originalRecord = query.data.find((r) => r.id === id);
      if (!originalRecord) return false;

      const originalTime = new Date(originalRecord.created_at);
      const newDate = new Date(editDate);

      // 기존 기록의 시/분/초 유지
      newDate.setHours(
        originalTime.getHours(),
        originalTime.getMinutes(),
        originalTime.getSeconds(),
      );

      const { error } = await supabase
        .from('records')
        .update({ created_at: newDate.toISOString() })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error((e as Error).message);
      return false;
    }
  };

  return {
    ...query,
    records: query.data || [],
    loading: query.isLoading,
    deleteRecord,
    updateRecordDate,
  };
}
