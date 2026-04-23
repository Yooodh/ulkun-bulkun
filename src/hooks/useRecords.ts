'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

import { StrengthRecord } from '@/types/record';

export function useRecords(userId: string | null | undefined = null) {
  const queryClient = useQueryClient();

  // 데이터 가져오기
  const query = useQuery({
    queryKey: ['records', userId],
    queryFn: async (): Promise<StrengthRecord[]> => {
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', userId!)
        .eq('status', 'completed')
        .order('recorded_at', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as StrengthRecord[]) || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // 데이터 삭제
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('records').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', userId] });
    },
  });

  // 날짜 수정
  const updateDateMutation = useMutation({
    mutationFn: async ({ id, editDate }: { id: string; editDate: string }) => {
      const { error } = await supabase
        .from('records')
        .update({ recorded_at: editDate })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', userId] });
    },
  });

  return {
    ...query,
    records: query.data || [],
    loading: query.isLoading,
    isReady: query.isSuccess,
    deleteRecord: deleteMutation.mutateAsync,
    updateRecordDate: (id: string, editDate: string) =>
      updateDateMutation.mutateAsync({ id, editDate }),
    isMutating: deleteMutation.isPending || updateDateMutation.isPending,
  };
}
