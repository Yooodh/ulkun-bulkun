'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { useAuth } from './useAuth';

import { supabase } from '@/lib/supabase';

import { RecordFormState, StrengthRecord, WeightField } from '@/types/record';

type UseRecordFormOptions = {
  onSuccess?: () => void;
  onCommitSuccess?: (fieldName: WeightField) => void;
  onError?: (message: string) => void;
};

const INITIAL_STATE: RecordFormState = {
  squat: '',
  deadlift: '',
  bench_press: '',
  ohp: '',
  squat_reps: '1',
  deadlift_reps: '1',
  bench_press_reps: '1',
  ohp_reps: '1',
};

const mapDataToState = (data: Partial<StrengthRecord>): RecordFormState => ({
  squat: data.squat?.toString() || '',
  deadlift: data.deadlift?.toString() || '',
  bench_press: data.bench_press?.toString() || '',
  ohp: data.ohp?.toString() || '',
  squat_reps: data.squat_reps?.toString() || '1',
  deadlift_reps: data.deadlift_reps?.toString() || '1',
  bench_press_reps: data.bench_press_reps?.toString() || '1',
  ohp_reps: data.ohp_reps?.toString() || '1',
});

export function useRecordForm({
  onSuccess,
  onCommitSuccess,
  onError,
}: UseRecordFormOptions = {}) {
  const { user } = useAuth();
  const [record, setRecord] = useState<RecordFormState>(INITIAL_STATE);
  const [lastCommits, setLastCommits] =
    useState<RecordFormState>(INITIAL_STATE);

  // insert 진행 중일 때 중복 insert 막기
  const isInsertingRef = useRef(false);

  // insert 완료 후 대기 중인 commit들이 draftId를 참조할 수 있게 Promise로 공유
  const draftIdRef = useRef<string | null>(null);
  const pendingDraftPromiseRef = useRef<Promise<string | null> | null>(null);

  // 초기 드래프트 로드
  useEffect(() => {
    if (!user?.id) return;

    const fetchDraft = async () => {
      const { data, error } = await supabase
        .from('records')
        .select<string, StrengthRecord>('*')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .maybeSingle();

      if (error) {
        console.error('Draft 로드 실패:', error.message);
        return;
      }

      if (data) {
        const state = mapDataToState(data);
        draftIdRef.current = data.id;
        setRecord(state);
        setLastCommits(state);
      }
    };

    fetchDraft();
  }, [user?.id]);

  // 스쿼트 + 데드리프트 + 벤치프레스 기준 합계
  const total =
    (Number(lastCommits.squat) || 0) +
    (Number(lastCommits.deadlift) || 0) +
    (Number(lastCommits.bench_press) || 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setRecord((prev) => {
      const updated = { ...prev, [name]: value };

      // 무게를 0으로 입력하면 횟수도 자동으로 0
      const repsKey = `${name}_reps` as keyof RecordFormState;
      if (repsKey in prev && value === '0') {
        updated[repsKey] = '0';
      }

      // 무게를 0이 아닌 값으로 바꾸면 횟수가 0이었을 때 1로 복구
      if (repsKey in prev && value !== '0' && prev[repsKey] === '0') {
        updated[repsKey] = '1';
      }

      return updated;
    });
  };

  const getOrCreateDraftId = useCallback(
    async (
      firstFieldName: keyof RecordFormState,
      firstValue: number,
      firstRepsKey: keyof RecordFormState,
      firstRepsValue: number,
    ): Promise<string | null> => {
      // 이미 draftId가 있으면 바로 반환
      if (draftIdRef.current) return draftIdRef.current;

      // insert 진행 중이면 해당 Promise가 끝날 때까지 대기
      if (isInsertingRef.current && pendingDraftPromiseRef.current) {
        return pendingDraftPromiseRef.current;
      }

      // 최초 insert 시작
      isInsertingRef.current = true;
      const insertPromise = (async () => {
        try {
          const { data, error } = await supabase
            .from('records')
            .insert({
              user_id: user!.id,
              [firstFieldName]: firstValue,
              [firstRepsKey]: firstRepsValue,
              status: 'draft',
            })
            .select('id')
            .single();

          if (error) throw error;

          draftIdRef.current = data.id;
          return data.id as string;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : '알 수 없는 에러가 발생했습니다.';
          onError?.(`저장 실패: ${message}`);
          return null;
        } finally {
          isInsertingRef.current = false;
          pendingDraftPromiseRef.current = null;
        }
      })();

      pendingDraftPromiseRef.current = insertPromise;
      return insertPromise;
    },
    [user, onError],
  );

  // 필드 단위 저장
  const handleCommit = async (fieldName: WeightField) => {
    if (!user) return;
    const value = Number(record[fieldName]) || 0;
    const repsKey = `${fieldName}_reps` as keyof RecordFormState;
    const repsValue = Number(record[repsKey]) || 1;

    try {
      if (draftIdRef.current) {
        const { error } = await supabase
          .from('records')
          .update({
            [fieldName]: value,
            [repsKey]: repsValue,
          })
          .eq('id', draftIdRef.current);
        if (error) throw error;
      } else {
        const id = await getOrCreateDraftId(
          fieldName,
          value,
          repsKey,
          repsValue,
        );
        if (!id) return;
      }

      setLastCommits((prev) => ({
        ...prev,
        [fieldName]: record[fieldName],
        [repsKey]: record[repsKey],
      }));
      onCommitSuccess?.(fieldName);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '알 수 없는 에러가 발생했습니다.';
      onError?.(`저장 실패: ${message}`);
    }
  };

  // 최종 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !draftIdRef.current)
      return onError?.('저장할 임시 기록이 없습니다.');

    const required: (keyof RecordFormState)[] = [
      'squat',
      'deadlift',
      'bench_press',
    ];
    if (
      required.some(
        (f) => lastCommits[f] === '' || lastCommits[f] === undefined,
      )
    ) {
      return onError?.(
        '스쿼트, 데드리프트, 벤치프레스 기록을 모두 완료해주세요.',
      );
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      const { error: updateError } = await supabase
        .from('records')
        .update({
          status: 'completed',
          total_weight: total,
          recorded_at: today,
        })
        .eq('id', draftIdRef.current);
      if (updateError) throw updateError;

      await supabase
        .from('profiles')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', user.id);

      // 상태 초기화
      draftIdRef.current = null;
      setRecord(INITIAL_STATE);
      setLastCommits(INITIAL_STATE);
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '저장 중 에러가 발생했습니다.';
      onError?.(message);
    }
  };

  return {
    record,
    total,
    handleChange,
    handleSubmit,
    handleCommit,
    lastCommits,
    user,
  };
}
