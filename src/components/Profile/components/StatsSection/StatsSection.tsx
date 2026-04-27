'use client';

import { useMemo } from 'react';

import styles from './StatsSection.module.scss';

import Loading from '@/components/shared/Loading/Loading';

import { formatDate } from '@/utils/dateUtils';
import { getBestRecord, calculateWeeklyStreak } from '@/utils/recordUtils';

import { StrengthRecord } from '@/types/record';

type StatsSectionProps = {
  records: StrengthRecord[];
  loading?: boolean;
};

export default function StatsSection({ records, loading }: StatsSectionProps) {
  const stats = useMemo(() => {
    if (!records || records.length === 0) {
      return {
        bigThree: 0,
        weeklyStreak: 0,
        sbdoStats: [
          { label: '스쿼트', value: 0, date: '' },
          { label: '데드', value: 0, date: '' },
          { label: '벤치', value: 0, date: '' },
          { label: 'OHP', value: 0, date: '' },
        ],
      };
    }

    const bestS = getBestRecord(records, 'squat');
    const bestB = getBestRecord(records, 'bench_press');
    const bestD = getBestRecord(records, 'deadlift');
    const bestO = getBestRecord(records, 'ohp');
    const weeklyStreak = calculateWeeklyStreak(records);

    return {
      bigThree: bestS.value + bestB.value + bestD.value,
      weeklyStreak,
      sbdoStats: [
        { label: '스쿼트', value: bestS.value, date: bestS.date },
        { label: '데드', value: bestD.value, date: bestD.date },
        { label: '벤치', value: bestB.value, date: bestB.date },
        { label: 'OHP', value: bestO.value, date: bestO.date },
      ],
    };
  }, [records]);

  if (loading) return <Loading message='기록을 불러오고 있어요!' />;

  return (
    <div className={styles.statsContainer}>
      <div className={styles.overviewWrapper}>
        <div className={styles.mainStatBox}>
          <label className={styles.statLabel}>PR</label>
          <strong className={styles.statValue}>
            {stats.bigThree}
            {stats.bigThree > 0 && <span>kg</span>}
          </strong>
        </div>
        <div className={styles.streakBox}>
          <strong className={styles.statValue}>{stats.weeklyStreak}</strong>
          <label className={styles.statLabel}>🔥주 연속 기록🔥</label>
        </div>
      </div>

      <div className={styles.recordsWrapper}>
        {stats.sbdoStats.map((s) => (
          <div key={s.label} className={styles.recordsBox}>
            <div className={styles.recordsHeader}>
              <label className={styles.recordsLabel}>{s.label}</label>
            </div>
            <strong className={styles.recordsValue}>
              {s.value}
              {s.value > 0 && <span>kg</span>}
            </strong>
            <span className={styles.recordsDate}>
              {s.date ? formatDate(s.date) : '기록 없음'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
