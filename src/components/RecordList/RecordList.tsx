'use client';

import { useState } from 'react';

import styles from './RecordList.module.scss';

import Loading from '../shared/Loading/Loading';
import Button from '../shared/Button/Button';
import Empty from '../shared/Empty/Empty';

import { useRecords } from '@/hooks/useRecords';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

import { formatDate, toInputDate } from '@/utils/dateUtils';

import { StrengthRecord } from '@/types/record';

type RecordListProps = {
  userId?: string;
};

export default function RecordList({ userId }: RecordListProps) {
  const { user } = useAuth();

  const targetId = userId || user?.id;

  const {
    records,
    loading: recordsLoading,
    deleteRecord,
    updateRecordDate,
  } = useRecords(targetId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string>('');

  const { profile, loading: profileLoading } = useProfile(targetId);

  const isReadOnly = !!userId;

  const displayName = profile?.nickname || (isReadOnly ? '불끈이' : '울끈이');

  const isPageLoading = recordsLoading || (isReadOnly && profileLoading);

  const handleBlur = async (id: string, originalDate: string) => {
    if (toInputDate(originalDate) !== editDate) {
      const success = await updateRecordDate(id, editDate);
      if (success) setEditingId(null);
    } else {
      setEditingId(null);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    id: string,
    originalDate: string,
  ) => {
    if (e.key === 'Enter') {
      handleBlur(id, originalDate);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  return (
    <div className={styles.listContainer}>
      <h1>
        <strong>{displayName}</strong> 님의 기록 히스토리
      </h1>

      <div className={styles.contentWrapper}>
        {isPageLoading ? (
          <Loading message='기록을 불러오고 있어요!' />
        ) : records.length === 0 ? (
          <Empty
            message={
              isReadOnly
                ? `${displayName}님의 운동 기록이 없습니다.`
                : '아직 기록된 운동이 없어요!'
            }
            subMessage={
              !isReadOnly
                ? '첫 번째 기록을 등록하고 성장을 추적해보세요!'
                : '기록이 등록되면 히스토리를 볼 수 있어요!'
            }
          />
        ) : (
          <div className={styles.listTable}>
            <table>
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>스쿼트</th>
                  <th>데드</th>
                  <th>벤치</th>
                  <th>OHP</th>
                  <th>합계</th>
                  {!isReadOnly && <th>관리</th>}
                </tr>
              </thead>
              <tbody>
                {records.map((r: StrengthRecord) => (
                  <tr key={r.id}>
                    <td>
                      {!isReadOnly && editingId === r.id ? (
                        <input
                          type='date'
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          onBlur={() => handleBlur(r.id, r.created_at)}
                          onKeyDown={(e) =>
                            handleKeyDown(e, r.id, r.created_at)
                          }
                          autoFocus
                        />
                      ) : (
                        <span
                          onClick={() => {
                            if (isReadOnly) return;
                            setEditingId(r.id);
                            setEditDate(toInputDate(r.created_at));
                          }}
                          className={
                            isReadOnly ? styles.pureDate : styles.clickableDate
                          }
                        >
                          {formatDate(r.created_at)}
                          {!isReadOnly && '✏️'}
                        </span>
                      )}
                    </td>
                    <td>{r.squat}kg</td>
                    <td>{r.deadlift}kg</td>
                    <td>{r.bench_press}kg</td>
                    <td>{r.ohp !== null ? `${r.ohp}kg` : '-'}</td>
                    <td className={styles.total}>{r.total_weight}kg</td>

                    {!isReadOnly && (
                      <td>
                        <Button
                          variant='red'
                          size='sm'
                          onClick={() => deleteRecord(r.id)}
                        >
                          삭제
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
