import { useEffect, useState, useCallback } from 'react';

import { supabase } from '@/lib/supabase';
import { StrengthRecord } from '@/types/record';

export function useRecords(userId: string | null = null) {
  const [records, setRecords] = useState<StrengthRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 데이터 가져오기
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      let targetId = userId;

      if (!targetId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        targetId = user?.id || null;
      }

      if (!targetId) return;

      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', targetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords((data as StrengthRecord[]) || []);
    } catch (e) {
      const error = e as Error;
      console.error('기록 로드 중 에러:', error.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 데이터 삭제
  const deleteRecord = async (id: string): Promise<void> => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase.from('records').delete().eq('id', id);
      if (error) throw error;
      await fetchRecords();
    } catch (e) {
      const error = e as Error;
      alert(error.message);
    }
  };

  // 날짜 수정
  const updateRecordDate = async (
    id: string,
    editDate: string,
  ): Promise<boolean> => {
    if (!editDate) return false;

    try {
      const originalRecord = records.find((r) => r.id === id);
      if (!originalRecord) return false;

      const originalTime = new Date(originalRecord.created_at);
      const newDate = new Date(editDate);

      // 상세 시간(시/분/초) 보존
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
      await fetchRecords();
      return true;
    } catch (e) {
      const error = e as Error;
      alert(error.message);
      return false;
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    loading,
    refresh: fetchRecords,
    deleteRecord,
    updateRecordDate,
  };
}
