'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import styles from './RecordList.module.scss';

import Pagination from '../shared/Pagination/Pagination';
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

const PAGE_SIZE = 6;

export default function RecordList({ userId }: RecordListProps) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  const {
    records,
    loading: recordsLoading,
    deleteRecord,
    updateRecordDate,
  } = useRecords(targetId);

  const { data: profile, isLoading: profileLoading } = useProfile(targetId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const isReadOnly = !!userId;
  const displayName = profile?.nickname || '';
  const isPageLoading = recordsLoading || (isReadOnly && profileLoading);

  const handleBlur = async (id: string, originalDate: string) => {
    if (toInputDate(originalDate) === editDate) {
      setEditingId(null);
      return;
    }

    try {
      await updateRecordDate(id, editDate);
      setEditingId(null);
    } catch (error) {
      toast.error('날짜 수정에 실패했습니다.');
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

  useEffect(() => {
    setCurrentPage(1);
  }, [records.length]);

  const paginatedRecords = records.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

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
                ? `${displayName}님의 기록이 없습니다.`
                : '아직 기록된 운동이 없어요!'
            }
            subMessage={
              !isReadOnly ? '첫 번째 기록을 등록하고 성장을 추적해보세요!' : ''
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
                {paginatedRecords.map((r: StrengthRecord) => {
                  const displayDate = r.recorded_at || r.created_at;

                  return (
                    <tr key={r.id}>
                      <td>
                        {!isReadOnly && editingId === r.id ? (
                          <input
                            type='date'
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            onBlur={() => handleBlur(r.id, displayDate)}
                            onKeyDown={(e) =>
                              handleKeyDown(e, r.id, displayDate)
                            }
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={
                              !isReadOnly
                                ? () => {
                                    setEditingId(r.id);
                                    setEditDate(toInputDate(displayDate));
                                  }
                                : undefined
                            }
                            className={
                              isReadOnly
                                ? styles.pureDate
                                : styles.clickableDate
                            }
                          >
                            {formatDate(displayDate)}
                            {!isReadOnly && ' ✏️'}
                          </span>
                        )}
                      </td>
                      <td>{r.squat}kg</td>
                      <td>{r.deadlift}kg</td>
                      <td>{r.bench_press}kg</td>
                      <td>{r.ohp ?? '-'}</td>
                      <td className={styles.total}>{r.total_weight}kg</td>
                      {!isReadOnly && (
                        <td>
                          <Button
                            variant='red'
                            size='sm'
                            onClick={async () => {
                              if (!confirm('정말 삭제하시겠습니까?')) return;
                              try {
                                await deleteRecord(r.id);
                              } catch (e) {
                                toast.error('삭제에 실패했습니다.');
                              }
                            }}
                          >
                            삭제
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination
              totalCount={records.length}
              pageSize={PAGE_SIZE}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
