'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import styles from './RecordList.module.scss';

import { StrengthRecord } from '@/types/record';

import Loading from '../shared/Loading/Loading';
import Button from '../shared/Button/Button';
import Empty from '../shared/Empty/Empty';

import { useRecords } from '@/hooks/useRecords';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

import { formatDate, toInputDate } from '@/utils/dateUtils';

type RecordListProps = {
  userId?: string;
};

export default function RecordList({ userId }: RecordListProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const targetId = userId || user?.id;

  const {
    data: records = [],
    isLoading: recordsLoading,
    deleteRecord,
    updateRecordDate,
  } = useRecords(targetId);

  const { data: profile, isLoading: profileLoading } = useProfile(targetId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string>('');

  const isReadOnly = !!userId;
  const displayName = profile?.nickname || '';
  const isPageLoading = recordsLoading || (isReadOnly && profileLoading);

  const handleBlur = async (id: string, originalDate: string) => {
    if (toInputDate(originalDate) !== editDate) {
      const success = await updateRecordDate(id, editDate);
      if (success) {
        setEditingId(null);
        queryClient.invalidateQueries({ queryKey: ['records', targetId] });
      }
    } else {
      setEditingId(null);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    id: string,
    originalDate: string,
  ) => {
    if (e.key === 'Enter') handleBlur(id, originalDate);
    else if (e.key === 'Escape') setEditingId(null);
  };

  return (
    <div className={styles.listContainer}>
      <h1>
        {displayName && (
          <>
            <strong>{displayName}</strong> 님의{' '}
          </>
        )}
        기록 히스토리
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
                          onClick={
                            !isReadOnly
                              ? () => {
                                  setEditingId(r.id);
                                  setEditDate(toInputDate(r.created_at));
                                }
                              : undefined
                          }
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
                          onClick={async () => {
                            if (!confirm('정말 삭제하시겠습니까?')) return;
                            const success = await deleteRecord(r.id);
                            if (success) {
                              // 여기서도 캐시 무효화!
                              queryClient.invalidateQueries({
                                queryKey: ['records', targetId],
                              });
                            } else {
                              alert('삭제에 실패했습니다.');
                            }
                          }}
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
