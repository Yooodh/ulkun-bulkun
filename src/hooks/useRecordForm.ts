import { useState } from 'react';

import { useAuth } from './useAuth';

import { supabase } from '@/lib/supabase';
import { RecordFormState } from '@/types/record';

export function useRecordForm() {
  const { user } = useAuth();
  const [record, setRecord] = useState<RecordFormState>({
    squat: '',
    deadlift: '',
    bench_press: '',
    ohp: '',
  });

  // 합계 계산
  const total: number =
    (Number(record.squat) || 0) +
    (Number(record.deadlift) || 0) +
    (Number(record.bench_press) || 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setRecord((prev) => ({
      ...prev,
      [name as keyof RecordFormState]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('로그인이 필요합니다!');

    // DB에 전송할 데이터
    const payload = {
      user_id: user.id,
      squat: Number(record.squat) || 0,
      deadlift: Number(record.deadlift) || 0,
      bench_press: Number(record.bench_press) || 0,
      ohp: record.ohp === '' ? null : Number(record.ohp),
      total_weight: total,
    };

    try {
      const { error } = await supabase.from('records').insert([payload]);
      if (error) throw error;

      alert('오늘의 득근 완료! 🔥');

      // 초기화
      setRecord({ squat: '', deadlift: '', bench_press: '', ohp: '' });
      window.location.reload();
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`저장 실패: ${error.message}`);
      }
    }
  };

  return {
    record,
    total,
    handleChange,
    handleSubmit,
    user,
  };
}
