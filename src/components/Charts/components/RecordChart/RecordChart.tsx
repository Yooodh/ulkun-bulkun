'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import {
  ValueType,
  NameType,
  Payload,
} from 'recharts/types/component/DefaultTooltipContent';
import { InfoIcon, ChevronLeft, ChevronRight } from 'lucide-react';

import Button from '@/components/shared/Button/Button';
import Loading from '@/components/shared/Loading/Loading';
import Empty from '@/components/shared/Empty/Empty';

import { useRecords } from '@/hooks/useRecords';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

import { StrengthRecord } from '@/types/record';

import styles from './RecordChart.module.scss';

type RecordChartProps = {
  userId?: string;
  tabButtons?: React.ReactNode;
};

type ChartPart = {
  key: keyof StrengthRecord;
  rmKey: keyof ChartDataPoint;
  label: string;
  color: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: Payload<ValueType, NameType>[];
  activePart: ChartPart;
};

type ChartDataPoint = StrengthRecord & {
  fullDate: string;
  xKey: string;
  squat_1rm: number;
  deadlift_1rm: number;
  bench_press_1rm: number;
  ohp_1rm: number;
  total_1rm: number;
};

type BrushRange = {
  startIndex: number;
  endIndex: number;
  startRatio: number;
  endRatio: number;
};

const PARTS: ChartPart[] = [
  { key: 'total_weight', rmKey: 'total_1rm', label: 'Total', color: '#007bff' },
  { key: 'squat', rmKey: 'squat_1rm', label: '스쿼트', color: '#EF4444' },
  { key: 'deadlift', rmKey: 'deadlift_1rm', label: '데드', color: '#F97316' },
  {
    key: 'bench_press',
    rmKey: 'bench_press_1rm',
    label: '벤치',
    color: '#22C55E',
  },
  { key: 'ohp', rmKey: 'ohp_1rm', label: 'OHP', color: '#A855F7' },
];

const VISIBLE_COUNT = 10;
const MOBILE_VISIBLE_COUNT = 6;

let savedBrushRange: BrushRange | undefined = undefined;

const CustomTooltip = ({
  active,
  payload,
  activePart,
  show1RM,
}: CustomTooltipProps & { show1RM: boolean }) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload as ChartDataPoint;
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipDate}>{point.fullDate}</p>
        <p className={styles.tooltipValue} style={{ color: payload[0].color }}>
          {`${activePart.label}: ${payload[0].value}kg${show1RM ? ' (추정 1RM)' : ''}`}
        </p>
      </div>
    );
  }
  return null;
};

// 1RM 계산
const calc1RM = (weight: number, reps: number): number => {
  if (reps <= 1) return weight;
  return Math.round(weight * (1 + reps / 30));
};

export default function RecordChart({ userId, tabButtons }: RecordChartProps) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  const { data: records = [], isLoading: recordsLoading } =
    useRecords(targetId);
  const { data: profile, isLoading: profileLoading } = useProfile(targetId);

  const [activePart, setActivePart] = useState<ChartPart>(PARTS[0]);
  const isReadOnly = !!userId;
  const displayName = profile?.nickname || '';

  const [show1RM, setShow1RM] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const visibleCount = isMobile ? MOBILE_VISIBLE_COUNT : VISIBLE_COUNT;
  const isPageLoading = recordsLoading || (isReadOnly && profileLoading);

  const chartData = useMemo(() => {
    return [...records]
      .sort((a, b) => {
        const dateA = new Date(a.recorded_at || a.created_at).getTime();
        const dateB = new Date(b.recorded_at || b.created_at).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      })
      .filter((r) => {
        const val = r[activePart.key as keyof StrengthRecord];

        // Total일 때는 3대 중 하나라도 0이면 제외
        if (activePart.key === 'total_weight') {
          return r.squat > 0 && r.deadlift > 0 && r.bench_press > 0;
        }

        return typeof val === 'number' && val > 0;
      })
      .map((r) => {
        const displayDate = r.recorded_at || r.created_at;
        const dateObj = new Date(displayDate);

        const squat1rm = calc1RM(r.squat, r.squat_reps ?? 1);
        const deadlift1rm = calc1RM(r.deadlift, r.deadlift_reps ?? 1);
        const benchPress1rm = calc1RM(r.bench_press, r.bench_press_reps ?? 1);
        const ohp1rm = r.ohp ? calc1RM(r.ohp, r.ohp_reps ?? 1) : 0;
        return {
          ...r,
          fullDate: dateObj.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          xKey: r.recorded_at
            ? `${r.recorded_at}_${r.created_at}`
            : r.created_at,
          squat_1rm: squat1rm,
          deadlift_1rm: deadlift1rm,
          bench_press_1rm: benchPress1rm,
          ohp_1rm: ohp1rm,
          total_1rm: squat1rm + deadlift1rm + benchPress1rm,
        };
      });
  }, [records, activePart]);

  const [brushRange, setBrushRange] = useState<
    { startIndex: number; endIndex: number } | undefined
  >(savedBrushRange);

  const prevVisibleCountRef = useRef(visibleCount);
  const prevActivePartRef = useRef(activePart.key);

  // 브러쉬 리셋
  useEffect(() => {
    savedBrushRange = undefined;
    setBrushRange(undefined);
  }, [targetId]);

  // 브러쉬 범위 계산 및 세팅
  useEffect(() => {
    if (chartData.length < 2) return;

    const visibleCountChanged = prevVisibleCountRef.current !== visibleCount;
    const activePartChanged = prevActivePartRef.current !== activePart.key;

    prevVisibleCountRef.current = visibleCount;
    prevActivePartRef.current = activePart.key;

    if (savedBrushRange && !visibleCountChanged && !activePartChanged) {
      const startIndex = Math.round(
        savedBrushRange.startRatio * (chartData.length - 1),
      );
      const endIndex = Math.round(
        savedBrushRange.endRatio * (chartData.length - 1),
      );

      if (startIndex >= endIndex) {
        const fallback: BrushRange = {
          startIndex: Math.max(0, chartData.length - visibleCount),
          endIndex: chartData.length - 1,
          startRatio:
            Math.max(0, chartData.length - visibleCount) /
            (chartData.length - 1),
          endRatio: 1,
        };
        savedBrushRange = fallback;
        setBrushRange(fallback);
        return;
      }
      setBrushRange({ startIndex, endIndex });
      return;
    }

    if (chartData.length > visibleCount) {
      const startIndex = chartData.length - visibleCount;
      const endIndex = chartData.length - 1;
      const initial: BrushRange = {
        startIndex,
        endIndex,
        startRatio: startIndex / (chartData.length - 1),
        endRatio: 1,
      };
      savedBrushRange = initial;
      setBrushRange(initial);
    } else {
      savedBrushRange = undefined;
      setBrushRange(undefined);
    }
  }, [chartData.length, activePart.key, visibleCount]);

  // 브러쉬 범위 업데이트
  const updateBrushRange = (next: { startIndex: number; endIndex: number }) => {
    savedBrushRange = {
      ...next,
      startRatio: next.startIndex / (chartData.length - 1),
      endRatio: next.endIndex / (chartData.length - 1),
    };
    setBrushRange(next);
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.header}>
        <h1>
          {displayName && (
            <>
              <strong>{displayName}</strong> 님의{' '}
            </>
          )}
          성장 곡선
        </h1>
        {tabButtons}
      </div>

      {!isPageLoading && records.length >= 2 && (
        <>
          <div className={styles.btnGroup}>
            {PARTS.map((part) => {
              const isActive = activePart.key === part.key;
              return (
                <Button
                  type='button'
                  key={part.key}
                  variant='ligray'
                  size='sm'
                  shape='round'
                  onClick={() => setActivePart(part)}
                  className={`${styles.partBtn} ${isActive ? styles.active : ''}`}
                  style={{
                    backgroundColor: isActive ? part.color : '',
                    borderColor: isActive ? part.color : '',
                  }}
                >
                  {part.label}
                </Button>
              );
            })}
          </div>

          <div className={styles.rmToggleWrapper}>
            <div className={styles.rmToggle}>
              <button
                type='button'
                className={`${styles.rmToggleBtn} ${!show1RM ? styles.rmActive : ''}`}
                onClick={() => setShow1RM(false)}
              >
                실제 무게
              </button>
              <button
                type='button'
                className={`${styles.rmToggleBtn} ${show1RM ? styles.rmActive : ''}`}
                onClick={() => setShow1RM(true)}
              >
                추정 1RM
              </button>
            </div>
            {show1RM && (
              <div className={styles.infoWrapper}>
                <InfoIcon className={styles.infoIcon} size={16} />
                <div className={styles.infoTooltip}>
                  <p className={styles.infoTitle}>추정 1RM 계산 방식</p>
                  <p className={styles.infoFormula}>
                    1RM = 무게 x (1 + 횟수 / 30)
                  </p>
                  <p className={styles.infoDesc}>
                    Epley 공식을 사용하며 1회 수행 시 입력 무게가 그대로
                    적용됩니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className={styles.contentWrapper}>
        {isPageLoading ? (
          <Loading message='차트 데이터를 분석하고 있어요!' />
        ) : chartData.length < 2 ? (
          <Empty
            message={
              isReadOnly
                ? `${displayName}님의 차트 데이터가 부족합니다.`
                : '차트를 그리려면 최소 2개 이상의 기록이 필요합니다.'
            }
            subMessage={
              !isReadOnly
                ? '오늘의 운동을 기록하고 성장 곡선을 확인해보세요!'
                : '아직 등록된 기록이 충분하지 않아요.'
            }
          />
        ) : (
          <>
            {/* 차트 */}
            <ResponsiveContainer width='100%' height={brushRange ? 375 : 350}>
              <LineChart
                data={chartData}
                className={styles.chartWrapper}
                margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
              >
                {/* 가로선 표시 그리드 */}
                <CartesianGrid
                  strokeDasharray='3 3'
                  vertical={false}
                  className={styles.chartGrid}
                />

                {/* 월/일 */}
                <XAxis
                  dataKey='xKey'
                  tickFormatter={(val) => {
                    const d = new Date(val.split('_')[0]);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  tick={{ className: styles.chartTick }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />

                {/* 데이터 범위 */}
                <YAxis
                  domain={['dataMin - 10', 'dataMax + 10']}
                  tick={{ className: styles.chartTick }}
                  tickLine={false}
                  axisLine={false}
                  unit='kg'
                  width={45}
                />
                <Tooltip
                  content={
                    <CustomTooltip activePart={activePart} show1RM={show1RM} />
                  }
                />

                {/* 선택된 부위 데이터 */}
                <Line
                  name={activePart.label}
                  type='monotone'
                  connectNulls={false}
                  dataKey={(entry) => {
                    const point = entry as ChartDataPoint;
                    const val = show1RM
                      ? point[activePart.rmKey]
                      : point[activePart.key];

                    // 값이 없거나 0이면 점 미표시
                    if (typeof val !== 'number' || val === 0) return null;
                    return val;
                  }}
                  stroke={activePart.color}
                  strokeWidth={3}
                  dot={{ r: 4, fill: activePart.color, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  isAnimationActive={true}
                />

                {/* 브러쉬 슬라이더 */}
                {brushRange && brushRange.endIndex < chartData.length && (
                  <Brush
                    key={activePart.key}
                    dataKey='xKey'
                    height={20}
                    stroke={activePart.color}
                    fill='transparent'
                    startIndex={brushRange.startIndex}
                    endIndex={brushRange.endIndex}
                    travellerWidth={isMobile ? 0 : 8}
                    className={styles.charBrush}
                    y={345}
                    tickFormatter={() => ''}
                    onChange={(range) => {
                      if (
                        range.startIndex !== undefined &&
                        range.endIndex !== undefined
                      ) {
                        if (isMobile) {
                          // 윈도우 크기 고정 및 드래그로 전체 이동
                          const size =
                            brushRange.endIndex - brushRange.startIndex;
                          const newStart = range.startIndex;
                          const newEnd = Math.min(
                            newStart + size,
                            chartData.length - 1,
                          );
                          updateBrushRange({
                            startIndex: newStart,
                            endIndex: newEnd,
                          });
                        } else {
                          updateBrushRange({
                            startIndex: range.startIndex,
                            endIndex: range.endIndex,
                          });
                        }
                      }
                    }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>

            {/* 브러쉬 내비게이션 버튼 */}
            {brushRange && brushRange.endIndex < chartData.length && (
              <div className={styles.brushNav}>
                {isMobile ? (
                  // 모바일
                  <>
                    <button
                      type='button'
                      aria-label='이전 기록 보기'
                      className={styles.brushNavBtn}
                      onClick={() => {
                        const size =
                          brushRange.endIndex - brushRange.startIndex;
                        const newStart = Math.max(0, brushRange.startIndex - 1);
                        updateBrushRange({
                          startIndex: newStart,
                          endIndex: newStart + size,
                        });
                      }}
                      disabled={brushRange.startIndex === 0}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className={styles.brushNavText}>
                      {brushRange.startIndex + 1} - {brushRange.endIndex + 1} /{' '}
                      {chartData.length}개
                    </span>
                    <button
                      type='button'
                      aria-label='다음 기록 보기'
                      className={styles.brushNavBtn}
                      onClick={() => {
                        const size =
                          brushRange.endIndex - brushRange.startIndex;
                        const newEnd = Math.min(
                          chartData.length - 1,
                          brushRange.endIndex + 1,
                        );
                        updateBrushRange({
                          startIndex: newEnd - size,
                          endIndex: newEnd,
                        });
                      }}
                      disabled={brushRange.endIndex === chartData.length - 1}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                ) : (
                  // 데스크탑
                  <>
                    <div className={styles.brushNavGroup}>
                      <button
                        type='button'
                        aria-label='시작 지점 왼쪽으로 이동'
                        className={styles.brushNavBtn}
                        onClick={() =>
                          updateBrushRange({
                            startIndex: Math.max(0, brushRange.startIndex - 1),
                            endIndex: brushRange.endIndex,
                          })
                        }
                        disabled={brushRange.startIndex === 0}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type='button'
                        aria-label='시작 지점 오른쪽으로 이동'
                        className={styles.brushNavBtn}
                        onClick={() =>
                          updateBrushRange({
                            startIndex: Math.min(
                              brushRange.startIndex + 1,
                              brushRange.endIndex - 1,
                            ),
                            endIndex: brushRange.endIndex,
                          })
                        }
                        disabled={
                          brushRange.startIndex >= brushRange.endIndex - 1
                        }
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                    <span className={styles.brushNavText}>
                      {brushRange.startIndex + 1} - {brushRange.endIndex + 1} /{' '}
                      {chartData.length}개
                    </span>
                    <div className={styles.brushNavGroup}>
                      <button
                        type='button'
                        aria-label='끝 지점 왼쪽으로 이동'
                        className={styles.brushNavBtn}
                        onClick={() =>
                          updateBrushRange({
                            startIndex: brushRange.startIndex,
                            endIndex: Math.max(
                              brushRange.endIndex - 1,
                              brushRange.startIndex + 1,
                            ),
                          })
                        }
                        disabled={
                          brushRange.endIndex <= brushRange.startIndex + 1
                        }
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type='button'
                        aria-label='끝 지점 오른쪽으로 이동'
                        className={styles.brushNavBtn}
                        onClick={() =>
                          updateBrushRange({
                            startIndex: brushRange.startIndex,
                            endIndex: Math.min(
                              brushRange.endIndex + 1,
                              chartData.length - 1,
                            ),
                          })
                        }
                        disabled={brushRange.endIndex === chartData.length - 1}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
