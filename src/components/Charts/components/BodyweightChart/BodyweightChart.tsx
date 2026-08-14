'use client';

import { useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  Rectangle,
  LabelList,
} from 'recharts';
import type { RectangleProps } from 'recharts';
import { InfoIcon } from 'lucide-react';

import Loading from '@/components/shared/Loading/Loading';
import Empty from '@/components/shared/Empty/Empty';

import { useRecords } from '@/hooks/useRecords';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

import { getBest1RM } from '@/utils/recordUtils';
import { calculateAge } from '@/utils/dateUtils';

import {
  LIFT_SUBJECTS,
  COLORS,
  getAgeBracket,
  getStandardKg,
  getReferenceBodyweight,
  type LiftSubject,
  type Gender,
  type AgeBracket,
} from '../../constants/strengthStandards';

import styles from './BodyweightChart.module.scss';

type BodyweightChartProps = {
  userId?: string;
  onHasDataChange?: (hasData: boolean) => void;
};

type ChartDataItem = {
  subject: LiftSubject;
  ratio: number;
  my1RM: number;
  standard: number;
  standardKg: number;
  score: number;
  fullMark: number;
};

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: {
    payload: ChartDataItem;
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
          <strong>
            {d.standardKg.toFixed(1)}kg ({d.standard.toFixed(2)}배)
          </strong>
        </p>
      </div>
    );
  }
  return null;
};

export default function BodyweightChart({
  userId,
  onHasDataChange,
}: BodyweightChartProps) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  const { data: records = [], isLoading: recordsLoading } =
    useRecords(targetId);
  const { data: profile, isLoading: profileLoading } = useProfile(targetId);

  const isReadOnly = !!userId;
  const displayName = profile?.nickname || '';
  const bodyweight = profile?.weight ?? null;
  const gender = profile?.gender ?? null;
  const birthDate = profile?.birth_date ?? null;
  const age = birthDate ? calculateAge(birthDate) : null;
  const ageBracket = age !== null ? getAgeBracket(age) : null;
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

  const chartData: ChartDataItem[] = useMemo(() => {
    if (!bestRecords || !bodyweight || !gender || !ageBracket) return [];

    const items: { subject: LiftSubject; my1RM: number }[] = [
      { subject: '스쿼트', my1RM: bestRecords.squat1rm },
      { subject: '데드', my1RM: bestRecords.deadlift1rm },
      { subject: '벤치', my1RM: bestRecords.bench1rm },
      { subject: 'OHP', my1RM: bestRecords.ohp1rm },
    ];

    return items.map((item) => {
      const ratio =
        item.my1RM > 0 ? Math.round((item.my1RM / bodyweight) * 100) / 100 : 0;

      // 체중/연령대 보간 + 연령 보정
      const standardKg = getStandardKg(
        gender,
        item.subject,
        ageBracket,
        bodyweight,
      );
      const standard =
        standardKg > 0 ? Math.round((standardKg / bodyweight) * 100) / 100 : 0;
      const score =
        standardKg > 0 ? Math.round((item.my1RM / standardKg) * 1000) / 10 : 0;

      return {
        subject: item.subject,
        ratio,
        my1RM: item.my1RM,
        standard,
        standardKg,
        score: Math.min(score, 200),
        fullMark: 150,
      };
    });
  }, [bestRecords, bodyweight, gender, ageBracket]);

  const hasEnoughData =
    !!bestRecords &&
    bestRecords.squat1rm > 0 &&
    bestRecords.deadlift1rm > 0 &&
    bestRecords.bench1rm > 0 &&
    !!bodyweight &&
    !!gender &&
    !!ageBracket;

  useEffect(() => {
    if (!isPageLoading) {
      onHasDataChange?.(hasEnoughData);
    }
  }, [isPageLoading, hasEnoughData, onHasDataChange]);

  const strongest = chartData.length
    ? chartData.reduce((a, b) => (a.score > b.score ? a : b))
    : null;

  const weakest = chartData.length
    ? chartData.reduce((a, b) => (a.score < b.score ? a : b))
    : null;

  const noWeight = !isPageLoading && records.length > 0 && !bodyweight;
  const noGender =
    !isPageLoading && records.length > 0 && !!bodyweight && !gender;
  const noBirthDate =
    !isPageLoading &&
    records.length > 0 &&
    !!bodyweight &&
    !!gender &&
    !ageBracket;

  // 실제 체중/연령대가 있으면 그 값으로, 없으면 대표 체중+ 기본 연령대(18-39)로 근사치
  const infoGender: Gender = gender ?? 'male';
  const infoBodyweight = bodyweight ?? getReferenceBodyweight(infoGender);
  const infoAgeBracket: AgeBracket = ageBracket ?? '18-39';

  return (
    <div className={styles.container}>
      <div className={styles.subtitleRow}>
        <p className={styles.subtitle}>
          체중 대비 1RM 배수 기준 중급자 목표치 달성률
        </p>
        <div className={styles.infoWrapper}>
          <InfoIcon size={15} className={styles.infoIcon} />
          <div className={styles.infoTooltip}>
            <p className={styles.infoTitle}>
              {infoGender === 'female' ? '여성' : '남성'}
              {ageBracket ? ` ${ageBracket}세` : ''}{' '}
              {bodyweight ? `${bodyweight}kg` : `${infoBodyweight}kg 참고`}{' '}
              중급자 목표 기준
            </p>
            <ul className={styles.infoList}>
              {LIFT_SUBJECTS.map((subject) => {
                const adjustedKg = getStandardKg(
                  infoGender,
                  subject,
                  infoAgeBracket,
                  infoBodyweight,
                );
                const multiple =
                  Math.round((adjustedKg / infoBodyweight) * 100) / 100;
                const label =
                  subject === '데드'
                    ? '데드리프트'
                    : subject === '벤치'
                      ? '벤치프레스'
                      : subject;
                return (
                  <li key={subject}>
                    <span>{label}</span>
                    <strong>
                      {adjustedKg}kg (x{multiple.toFixed(2)})
                    </strong>
                  </li>
                );
              })}
            </ul>
            <p className={styles.infoDesc}>
              ExRx.net 근력 기준(성인{' '}
              {infoGender === 'female' ? '여성' : '남성'}{' '}
              {ageBracket ?? '18-39'}세)을 체중 구간별로 보간한 값입니다.
              체급·훈련 경력에 따라 다를 수 있어요.
              {!bodyweight &&
                ' (체중 미등록 상태라 참고용 체중 기준으로 표시 중이에요)'}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        {isPageLoading ? (
          <div className={styles.stateWrapper}>
            <Loading message='체중 대비 데이터를 분석하고 있어요!' />
          </div>
        ) : noWeight ? (
          <div className={styles.stateWrapper}>
            <Empty
              message='체중 정보가 없어요.'
              subMessage={
                isReadOnly
                  ? `${displayName}님이 아직 체중을 등록하지 않았어요.`
                  : '프로필 수정에서 체중을 입력하면 체중 대비 밸런스를 확인할 수 있어요!'
              }
            />
          </div>
        ) : noGender ? (
          <div className={styles.stateWrapper}>
            <Empty
              message='성별 정보가 없어요.'
              subMessage={
                isReadOnly
                  ? `${displayName}님이 아직 성별을 등록하지 않았어요.`
                  : '프로필 수정에서 성별을 입력하면 체중 대비 밸런스를 확인할 수 있어요!'
              }
            />
          </div>
        ) : noBirthDate ? (
          <div className={styles.stateWrapper}>
            <Empty
              message='생년월일 정보가 없어요.'
              subMessage={
                isReadOnly
                  ? `${displayName}님이 아직 생년월일을 등록하지 않았어요.`
                  : '프로필 수정에서 생년월일을 입력하면 체중 대비 밸런스를 확인할 수 있어요!'
              }
            />
          </div>
        ) : !hasEnoughData ? (
          <div className={styles.stateWrapper}>
            <Empty
              message='밸런스 분석을 위한 데이터가 부족합니다.'
              subMessage='스쿼트, 데드리프트, 벤치프레스 기록이 필요해요.'
            />
          </div>
        ) : (
          <>
            <div className={styles.bodyweightBadge}>
              <div className={styles.badgeItem}>
                <span className={styles.badgeLabel}>체중</span>
                <span className={styles.badgeValue}>{bodyweight}kg</span>
              </div>
              <span className={styles.badgeDivider} />
              <div className={styles.badgeItem}>
                <span className={styles.badgeLabel}>성별</span>
                <span className={styles.badgeValue}>
                  {gender === 'female' ? '여성' : '남성'}
                </span>
              </div>
              <span className={styles.badgeDivider} />
              <div className={styles.badgeItem}>
                <span className={styles.badgeLabel}>나이</span>
                <span className={styles.badgeValue}>{age}세</span>
              </div>
            </div>

            <div className={styles.chartArea}>
              <ResponsiveContainer
                width='100%'
                height='100%'
                initialDimension={{ width: 320, height: 200 }}
              >
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
                        COLORS[payload.value as LiftSubject] ?? '#6b7280';
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

                  <Bar
                    dataKey='score'
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                    shape={(
                      props: RectangleProps & { payload?: ChartDataItem },
                    ) => {
                      const { x, y, width, height, payload } = props;
                      if (!payload) return <Rectangle {...props} />;

                      const color = COLORS[payload.subject] ?? '#6b7280';
                      const fill = payload.score >= 100 ? color : `${color}66`;

                      return (
                        <Rectangle
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          radius={[6, 6, 0, 0]}
                          fill={fill}
                        />
                      );
                    }}
                  >
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
            </div>

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
