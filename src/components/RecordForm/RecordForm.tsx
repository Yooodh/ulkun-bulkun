'use client';

import { useQueryClient } from '@tanstack/react-query';

import styles from './RecordForm.module.scss';

import Button from '../shared/Button/Button';

import { useRecordForm } from '@/hooks/useRecordForm';

import { blockInvalidNumberChars, stopWheelChange } from '@/utils/inputUtils';

import { RecordFormState } from '@/types/record';

const FIELDS: {
  name: keyof RecordFormState;
  label: string;
  required: boolean;
  ko: string;
}[] = [
  { name: 'squat', label: '스쿼트 (kg)', required: true, ko: '스쿼트' },
  {
    name: 'deadlift',
    label: '데드리프트 (kg)',
    required: true,
    ko: '데드리프트',
  },
  {
    name: 'bench_press',
    label: '벤치프레스 (kg)',
    required: true,
    ko: '벤치프레스',
  },
  { name: 'ohp', label: 'OHP (kg)', required: false, ko: 'OHP' },
];

export default function RecordForm() {
  const queryClient = useQueryClient();

  const {
    user,
    record,
    total,
    handleChange,
    handleSubmit,
    handleCommit,
    lastCommits,
  } = useRecordForm({
    onSuccess: () => {
      alert('모든 기록을 저장했어요!');
      if (user?.id)
        queryClient.invalidateQueries({ queryKey: ['records', user.id] });
    },
    onCommitSuccess: (fieldName) => {
      const field = FIELDS.find((f) => f.name === fieldName);
      alert(`${field?.ko || fieldName} 기록 완료!`);
    },
    onError: (message) => alert(`저장 실패: ${message}`),
  });

  const isAllRequiredCommitted = FIELDS.filter((f) => f.required).every(
    (f) => lastCommits[f.name],
  );

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.title}>💪 울끈불끈 기록</h1>
      <form onSubmit={handleSubmit}>
        {FIELDS.map(({ name, label, required }) => {
          const committedValue = lastCommits[name];
          const isFieldCommitted = !!committedValue;

          return (
            <div key={name} className={styles.inputGroup}>
              <label>{label}</label>
              <div className={styles.inputAction}>
                <input
                  type='number'
                  name={name}
                  inputMode='numeric'
                  onKeyDown={blockInvalidNumberChars}
                  onWheel={stopWheelChange}
                  value={record[name]}
                  onChange={handleChange}
                  onFocus={(e) => e.target.select()}
                  placeholder={required ? '0' : '선택'}
                  required={required}
                  disabled={!user}
                  className={styles.mainInput}
                />

                <input
                  type='text'
                  readOnly
                  value={isFieldCommitted ? `${committedValue}kg` : '-'}
                  className={`${styles.statusInput} ${
                    isFieldCommitted
                      ? styles.committed
                      : required
                        ? styles.uncommitted
                        : styles.uncommittedOptional
                  }`}
                />

                <Button
                  type='button'
                  variant='blue'
                  size='sm'
                  className={styles.commitBtn}
                  onClick={() => handleCommit(name)}
                  disabled={!user || !record[name]}
                >
                  기록
                </Button>
              </div>

              {name === 'ohp' && (
                <label className={styles.ohpdec}>
                  * OHP 기록은 합계에 포함되지 않습니다.
                </label>
              )}
            </div>
          );
        })}

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
          disabled={!user || !isAllRequiredCommitted}
        >
          {!user
            ? '로그인이 필요합니다'
            : !isAllRequiredCommitted
              ? '필수 항목을 기록해주세요'
              : '저장'}
        </Button>
      </form>
    </div>
  );
}
