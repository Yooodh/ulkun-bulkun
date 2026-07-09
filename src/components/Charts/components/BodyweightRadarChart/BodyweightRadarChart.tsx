'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  Cell,
  LabelList,
} from 'recharts';
import { InfoIcon } from 'lucide-react';

import Loading from '@/components/shared/Loading/Loading';
import Empty from '@/components/shared/Empty/Empty';

import { useRecords } from '@/hooks/useRecords';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

import { StrengthRecord } from '@/types/record';

import styles from './BodyweightRadarChart.module.scss';

type BodyweightRadarChartProps = {
  userId?: string;
  tabButtons?: React.ReactNode;
};

// 중급자 목표 기준 (체중 배수)
// 출처: ExRx.net Strength Standards (Adult, 18-39세 기준)
// 다수의 트레이닝 참고자료(Legion, TrainCalc 등)에서 공통으로 수렴하는 값
// 성별/체급에 따른 정밀 보정 필요
const STANDARD_MULTIPLIERS: Record<string, number> = {
  스쿼트: 1.5,
  데드: 2.0,
  벤치: 1.25,
  OHP: 0.8,
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
      ratio: number;
      my1RM: number;
      standard: number;
      score: number;
    };
  }[];
}) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipTitle}>{d.subject}</p>
        <p className={styles.tooltipRow}>
          <span>체중 대비</span>
          <strong style={{ color: d.score >= 100 ? '#007bff' : '#93c5fd' }}>
            {d.ratio.toFixed(2)}배
          </strong>
        </p>
        <p className={styles.tooltipRow}>
          <span>추정 1RM</span>
          <strong>{d.my1RM}kg</strong>
        </p>
        <p className={styles.tooltipRow}>
          <span>목표 기준</span>
          <strong>{d.standard.toFixed(2)}배</strong>
        </p>
      </div>
    );
  }
  return null;
};

export default function BodyweightRadarChart({
  userId,
  tabButtons,
}: BodyweightRadarChartProps) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  const { data: records = [], isLoading: recordsLoading } =
    useRecords(targetId);
  const { data: profile, isLoading: profileLoading } = useProfile(targetId);

  const isReadOnly = !!userId;
  const displayName = profile?.nickname || '';
  const bodyweight = profile?.weight ?? null;
  const isPageLoading = recordsLoading || profileLoading;

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
    if (!bestRecords || !bodyweight) return [];

    const items = [
      { subject: '스쿼트', my1RM: bestRecords.squat1rm },
      { subject: '데드', my1RM: bestRecords.deadlift1rm },
      { subject: '벤치', my1RM: bestRecords.bench1rm },
      { subject: 'OHP', my1RM: bestRecords.ohp1rm },
    ];

    return items.map((item) => {
      const ratio =
        item.my1RM > 0 ? Math.round((item.my1RM / bodyweight) * 100) / 100 : 0;
      const standard = STANDARD_MULTIPLIERS[item.subject];
      // 기준 대비 달성률 (100% = 기준 배수 달성)
      const score =
        standard > 0 ? Math.round((ratio / standard) * 1000) / 10 : 0;

      return {
        subject: item.subject,
        ratio,
        my1RM: item.my1RM,
        standard,
        score: Math.min(score, 200),
        fullMark: 150,
      };
    });
  }, [bestRecords, bodyweight]);

  const hasEnoughData =
    !!bestRecords &&
    bestRecords.squat1rm > 0 &&
    bestRecords.deadlift1rm > 0 &&
    bestRecords.bench1rm > 0 &&
    !!bodyweight;

  const strongest = chartData.length
    ? chartData.reduce((a, b) => (a.score > b.score ? a : b))
    : null;

  const weakest = chartData.length
    ? chartData.reduce((a, b) => (a.score < b.score ? a : b))
    : null;

  const noWeight = !isPageLoading && records.length > 0 && !bodyweight;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          {displayName && (
            <>
              <strong>{displayName}</strong> 님의{' '}
            </>
          )}
          체중 대비 밸런스
        </h1>
        {tabButtons}
      </div>

      <div className={styles.subtitleRow}>
        <p className={styles.subtitle}>
          체중 대비 1RM 배수 기준 중급자 목표치 달성률
        </p>
        <div className={styles.infoWrapper}>
          <InfoIcon size={15} className={styles.infoIcon} />
          <div className={styles.infoTooltip}>
            <p className={styles.infoTitle}>중급자 목표 기준 (체중 배수)</p>
            <ul className={styles.infoList}>
              <li>
                <span>스쿼트</span>
                <strong>x 1.5</strong>
              </li>
              <li>
                <span>데드리프트</span>
                <strong>x 2.0</strong>
              </li>
              <li>
                <span>벤치프레스</span>
                <strong>x 1.25</strong>
              </li>
              <li>
                <span>OHP</span>
                <strong>x 0.8</strong>
              </li>
            </ul>
            <p className={styles.infoDesc}>
              ExRx.net 근력 기준(성인 18-39세)을 참고한 일반적인 중급자
              지표이며, 성별·체급에 따라 다를 수 있어요. 참고용 지표입니다.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        {isPageLoading ? (
          <Loading message='체중 대비 데이터를 분석하고 있어요!' />
        ) : noWeight ? (
          <Empty
            message='체중 정보가 없어요.'
            subMessage={
              isReadOnly
                ? `${displayName}님이 아직 체중을 등록하지 않았어요.`
                : '프로필 편집에서 체중을 입력하면 체중 대비 밸런스를 확인할 수 있어요!'
            }
          />
        ) : !hasEnoughData ? (
          <Empty
            message='밸런스 분석을 위한 데이터가 부족합니다.'
            subMessage='스쿼트, 데드리프트, 벤치프레스 기록이 필요해요.'
          />
        ) : (
          <>
            <div className={styles.bodyweightBadge}>
              <span className={styles.badgeLabel}>현재 체중</span>
              <span className={styles.badgeValue}>{bodyweight}kg</span>
            </div>

            <ResponsiveContainer width='100%' height={260}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, bottom: 10, left: 30 }}
                barCategoryGap='30%'
              >
                <CartesianGrid
                  vertical={false}
                  stroke='var(--border-soft, #e5e7eb)'
                />

                <XAxis
                  dataKey='subject'
                  axisLine={false}
                  tickLine={false}
                  tick={({ x, y, payload }) => {
                    const color =
                      COLORS[payload.value as keyof typeof COLORS] ?? '#6b7280';
                    return (
                      <text
                        x={x}
                        y={Number(y) + 12}
                        textAnchor='middle'
                        fill={color}
                        fontSize={13}
                        fontWeight={600}
                      >
                        {payload.value}
                      </text>
                    );
                  }}
                />

                <YAxis hide domain={[0, 'dataMax + 20']} />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                />

                {/* 기준선 (100%) */}
                <ReferenceLine
                  y={100}
                  stroke='#d1d5db'
                  strokeDasharray='4 4'
                  strokeWidth={1.5}
                  label={{
                    value: '목표',
                    position: 'right',
                    fill: '#9ca3af',
                    fontSize: 11,
                  }}
                />

                <Bar dataKey='score' radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.subject}
                      fill={
                        entry.score >= 100
                          ? COLORS[entry.subject as keyof typeof COLORS]
                          : `${COLORS[entry.subject as keyof typeof COLORS]}66` // 목표 미달 시 반투명
                      }
                    />
                  ))}
                  <LabelList
                    dataKey='ratio'
                    position='top'
                    formatter={(v: unknown) => {
                      if (v === null || v === undefined) return '';
                      const num = Number(v);
                      return Number.isNaN(num) ? '' : `${num.toFixed(2)}배`;
                    }}
                    fontSize={12}
                    fontWeight={600}
                    fill='#374151'
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {strongest && weakest && strongest.subject !== weakest.subject && (
              <div className={styles.summary}>
                <div className={`${styles.summaryItem} ${styles.strong}`}>
                  <span className={styles.summaryIcon}>💪</span>
                  <div>
                    <p className={styles.summaryLabel}>강점</p>
                    <p className={styles.summaryValue}>
                      {strongest.subject}{' '}
                      <span>({strongest.ratio.toFixed(2)}배)</span>
                    </p>
                  </div>
                </div>
                <div className={`${styles.summaryItem} ${styles.weak}`}>
                  <span className={styles.summaryIcon}>🎯</span>
                  <div>
                    <p className={styles.summaryLabel}>보완 필요</p>
                    <p className={styles.summaryValue}>
                      {weakest.subject}{' '}
                      <span>({weakest.ratio.toFixed(2)}배)</span>
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
