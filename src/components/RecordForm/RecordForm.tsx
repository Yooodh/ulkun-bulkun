'use client';

import { useQueryClient } from '@tanstack/react-query';

import styles from './RecordForm.module.scss';

import Button from '../shared/Button/Button';

import { useRecordForm } from '@/hooks/useRecordForm';

import { blockInvalidNumberChars, stopWheelChange } from '@/utils/inputUtils';

const FIELDS = [
  { name: 'squat', label: '스쿼트 (kg)', required: true },
  { name: 'deadlift', label: '데드리프트 (kg)', required: true },
  { name: 'bench_press', label: '벤치프레스 (kg)', required: true },
  { name: 'ohp', label: 'OHP (kg)', required: false },
];

export default function RecordForm() {
  const queryClient = useQueryClient();

  const { user, record, total, handleChange, handleSubmit } = useRecordForm({
    onSuccess: () => {
      alert('오늘의 득근 완료! 🔥');

      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['records', user.id] });
      }
    },
    onError: (message) => {
      alert(`저장 실패: ${message}`);
    },
  });

  return (
    <div className={styles.formContainer}>
      <h1>💪 울끈불끈 기록</h1>
      <form onSubmit={handleSubmit}>
        {FIELDS.map(({ name, label, required }) => (
          <div key={name} className={styles.inputGroup}>
            <label>{label}</label>
            <input
              type='number'
              name={name}
              inputMode='numeric'
              onKeyDown={blockInvalidNumberChars}
              onWheel={stopWheelChange}
              value={record[name as keyof typeof record]}
              onChange={handleChange}
              onFocus={(e) => e.target.select()}
              placeholder={required ? '0' : '선택 입력 사항'}
              required={required}
              disabled={!user}
            />
            {name === 'ohp' && (
              <label className={styles.ohpdec}>
                * OHP 기록은 합계에 포함되지 않습니다.
              </label>
            )}
          </div>
        ))}

        <div className={`${styles.inputGroup} ${styles.totalGroup}`}>
          <label>총 합계 (Total kg)</label>
          <input
            type='text'
            value={`${total} kg`}
            readOnly
            className={styles.totalInput}
          />
        </div>

        <Button
          variant='blue'
          size='md'
          type='submit'
          className={styles.submitBtn}
          disabled={!user}
        >
          {user ? '저장하기' : '로그인이 필요합니다'}
        </Button>
      </form>
    </div>
  );
}
