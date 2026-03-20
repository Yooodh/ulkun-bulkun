'use client';

import styles from './RecordForm.module.scss';

import Button from '../shared/Button/Button';
import { useRecordForm } from '@/hooks/useRecordForm';
import { blockInvalidNumberChars, stopWheelChange } from '@/utils/inputUtils';

export default function RecordForm() {
  const { user, record, total, handleChange, handleSubmit } = useRecordForm();

  return (
    <div className={styles.formContainer}>
      <h1>💪 울끈불끈 기록</h1>

      <form onSubmit={handleSubmit}>
        {/* 필수 입력 */}
        <div className={styles.inputGroup}>
          <label>스쿼트 (kg)</label>
          <input
            type='number'
            name='squat'
            inputMode='numeric'
            onKeyDown={blockInvalidNumberChars}
            onWheel={stopWheelChange}
            value={record.squat}
            onChange={handleChange}
            onFocus={(e) => e.target.select()}
            placeholder='0'
            required
            disabled={!user}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>데드리프트 (kg)</label>
          <input
            type='number'
            name='deadlift'
            inputMode='numeric'
            onKeyDown={blockInvalidNumberChars}
            onWheel={stopWheelChange}
            value={record.deadlift}
            onChange={handleChange}
            onFocus={(e) => e.target.select()}
            placeholder='0'
            required
            disabled={!user}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>벤치프레스 (kg)</label>
          <input
            type='number'
            name='bench_press'
            inputMode='numeric'
            onKeyDown={blockInvalidNumberChars}
            onWheel={stopWheelChange}
            value={record.bench_press}
            onChange={handleChange}
            onFocus={(e) => e.target.select()}
            placeholder='0'
            required
            disabled={!user}
          />
        </div>

        {/* 선택 입력 */}
        <div className={styles.inputGroup}>
          <label>OHP (kg)</label>
          <input
            name='ohp'
            type='number'
            inputMode='numeric'
            onKeyDown={blockInvalidNumberChars}
            onWheel={stopWheelChange}
            value={record.ohp}
            onChange={handleChange}
            placeholder='선택 입력 사항'
            disabled={!user}
          />
          <label className={styles.ohpdec}>
            * OHP 기록은 합계에 포함되지 않습니다.
          </label>
        </div>

        {/* 합계 */}
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
