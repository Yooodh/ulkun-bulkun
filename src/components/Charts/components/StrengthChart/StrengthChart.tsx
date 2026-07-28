'use client';

import { useMemo } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { InfoIcon } from 'lucide-react';

import Loading from '@/components/shared/Loading/Loading';
import Empty from '@/components/shared/Empty/Empty';

import { useRecords } from '@/hooks/useRecords';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

import { StrengthRecord } from '@/types/record';

import styles from './StrengthChart.module.scss';

type StrengthChartProps = {
  userId?: string;
  tabButtons?: React.ReactNode;
};

const STANDARD_RATIOS: Record<string, number> = {
  스쿼트: 1.0,
  데드: 1.2,
  벤치: 0.75,
  OHP: 0.5,
};

const COLORS: Record<string, string> = {
  스쿼트: '#EF4444',
  데드: '#F97316',
  벤치: '#22C55E',
  OHP: '#A855F7',
};

const calc1RM = (weight: number, reps: number): number => {
  if (reps <= 1) return weight;
  return Math.round(weight * (1 + reps / 30));
};

const getBest1RM = (
  records: StrengthRecord[],
  weightKey: keyof StrengthRecord,
  repsKey: keyof StrengthRecord,
): number => {
  return records.reduce((best, record) => {
    const weight = Number(record[weightKey] ?? 0);
    const reps = Number(record[repsKey] ?? 1);
    const oneRm = weight > 0 ? calc1RM(weight, reps) : 0;

    return oneRm > best ? oneRm : best;
  }, 0);
};

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: {
    payload: {
      subject: string;
      score: number;
      my1RM: number;
      standard: number;
    };
  }[];
}) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;

    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipTitle}>{d.subject}</p>
        <p className={styles.tooltipRow}>
          <span>기준 대비</span>
          <strong style={{ color: d.score >= 100 ? '#007bff' : '#EF4444' }}>
            {d.score.toFixed(1)}%
          </strong>
        </p>
        <p className={styles.tooltipRow}>
          <span>최고 추정 1RM</span>
          <strong>{d.my1RM}kg</strong>
        </p>
        <p className={styles.tooltipRow}>
          <span>기준값</span>
          <strong>{d.standard}kg</strong>
        </p>
      </div>
    );
  }

  return null;
};

export default function StrengthChart({
  userId,
  tabButtons,
}: StrengthChartProps) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  const { data: records = [], isLoading: recordsLoading } =
    useRecords(targetId);
  const { data: profile, isLoading: profileLoading } = useProfile(targetId);

  const isReadOnly = !!userId;
  const displayName = profile?.nickname || '';
  const isPageLoading = recordsLoading || (isReadOnly && profileLoading);

  const bestRecords = useMemo(() => {
    if (!records.length) return null;

    return {
      squat1rm: getBest1RM(records, 'squat', 'squat_reps'),
      deadlift1rm: getBest1RM(records, 'deadlift', 'deadlift_reps'),
      bench1rm: getBest1RM(records, 'bench_press', 'bench_press_reps'),
      ohp1rm: getBest1RM(records, 'ohp', 'ohp_reps'),
    };
  }, [records]);

  const chartData = useMemo(() => {
    if (!bestRecords) return [];

    const { squat1rm, deadlift1rm, bench1rm, ohp1rm } = bestRecords;
    const squatBase = squat1rm;

    const items = [
      { subject: '스쿼트', my1RM: squat1rm },
      { subject: '데드', my1RM: deadlift1rm },
      { subject: '벤치', my1RM: bench1rm },
      { subject: 'OHP', my1RM: ohp1rm },
    ];

    return items.map((item) => {
      const standardVal = Math.round(squatBase * STANDARD_RATIOS[item.subject]);
      const score = standardVal > 0 ? (item.my1RM / standardVal) * 100 : 0;

      return {
        subject: item.subject,
        score: Math.min(Math.round(score * 10) / 10, 200),
        my1RM: item.my1RM,
        standard: standardVal,
        fullMark: 150,
      };
    });
  }, [bestRecords]);

  const hasEnoughData =
    !!bestRecords &&
    bestRecords.squat1rm > 0 &&
    bestRecords.deadlift1rm > 0 &&
    bestRecords.bench1rm > 0;

  const strongest = chartData.length
    ? chartData.reduce((a, b) => (a.score > b.score ? a : b))
    : null;

  const weakest = chartData.length
    ? chartData.reduce((a, b) => (a.score < b.score ? a : b))
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          {displayName && (
            <>
              <strong>{displayName}</strong> 님의{' '}
            </>
          )}
          종목 밸런스
        </h1>

        {tabButtons}
      </div>

      <div className={styles.subtitleRow}>
        <p className={styles.subtitle}>
          스쿼트 최고 추정 1RM 기준 파워리프팅 권장 비율 대비 수치
        </p>

        <div className={styles.infoWrapper}>
          <InfoIcon size={15} className={styles.infoIcon} />
          <div className={styles.infoTooltip}>
            <p className={styles.infoTitle}>지표 계산 방식</p>
            <ul className={styles.infoList}>
              <li>
                <span>스쿼트</span>
                <strong>기준 (1.0)</strong>
              </li>
              <li>
                <span>데드리프트</span>
                <strong>x 1.2</strong>
              </li>
              <li>
                <span>벤치프레스</span>
                <strong>x 0.75</strong>
              </li>
              <li>
                <span>OHP</span>
                <strong>x 0.5</strong>
              </li>
            </ul>
            <p className={styles.infoDesc}>
              전체 기록 중 종목별 최고 추정 1RM을 기준으로 비교해요. 공식 기준은
              아니며 밸런스 참고용 지표입니다.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        {isPageLoading ? (
          <Loading message='밸런스를 분석하고 있어요' />
        ) : !hasEnoughData ? (
          <Empty
            message='밸런스 분석을 위한 데이터가 부족합니다.'
            subMessage='스쿼트, 데드리프트, 벤치프레스 기록이 필요해요.'
          />
        ) : (
          <>
            <div className={styles.chartArea}>
              <ResponsiveContainer width='100%' height='100%'>
                <RadarChart
                  accessibilityLayer={false}
                  data={chartData}
                  margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
                >
                  <PolarGrid stroke='var(--border-soft, #e5e7eb)' />
                  <PolarAngleAxis
                    dataKey='subject'
                    tick={({ x, y, payload }) => {
                      const color =
                        COLORS[payload.value as keyof typeof COLORS] ??
                        '#6b7280';

                      return (
                        <text
                          x={x}
                          y={y}
                          textAnchor='middle'
                          dominantBaseline='central'
                          fill={color}
                          fontSize={13}
                          fontWeight={600}
                        >
                          {payload.value}
                        </text>
                      );
                    }}
                  />

                  <Tooltip content={<CustomTooltip />} cursor={false} />

                  <Radar
                    name='기준'
                    dataKey={() => 100}
                    stroke='#d1d5db'
                    fill='#f3f4f6'
                    fillOpacity={0.4}
                    strokeDasharray='4 4'
                    strokeWidth={1.5}
                    dot={false}
                  />

                  <Radar
                    name='수치'
                    dataKey='score'
                    stroke='#007bff'
                    fill='#007bff'
                    fillOpacity={0.2}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#007bff', strokeWidth: 0 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.scoreList}>
              {chartData.map((item) => {
                const isOver = item.score >= 100;
                const barWidth = Math.min(item.score, 150);

                return (
                  <div key={item.subject} className={styles.scoreItem}>
                    <span
                      className={styles.scoreLabel}
                      style={{
                        color: COLORS[item.subject as keyof typeof COLORS],
                      }}
                    >
                      {item.subject}
                    </span>

                    <div className={styles.barWrapper}>
                      <div
                        className={styles.bar}
                        style={{
                          width: `${(barWidth / 150) * 100}%`,
                          backgroundColor: isOver ? '#007bff' : '#93c5fd',
                        }}
                      />
                      <div className={styles.baseline} />
                    </div>

                    <span
                      className={styles.scoreValue}
                      style={{ color: isOver ? '#007bff' : '#6b7280' }}
                    >
                      {item.score.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>

            {strongest && weakest && strongest.subject !== weakest.subject && (
              <div className={styles.summary}>
                <div className={`${styles.summaryItem} ${styles.strong}`}>
                  <span className={styles.summaryIcon}>💪</span>
                  <div>
                    <p className={styles.summaryLabel}>강점</p>
                    <p className={styles.summaryValue}>
                      {strongest.subject}{' '}
                      <span>({strongest.score.toFixed(1)}%)</span>
                    </p>
                  </div>
                </div>

                <div className={`${styles.summaryItem} ${styles.weak}`}>
                  <span className={styles.summaryIcon}>🎯</span>
                  <div>
                    <p className={styles.summaryLabel}>보완 필요</p>
                    <p className={styles.summaryValue}>
                      {weakest.subject}{' '}
                      <span>({weakest.score.toFixed(1)}%)</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
