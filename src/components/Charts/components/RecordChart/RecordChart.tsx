'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  InfoIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  NameType,
  Payload,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

import Button from '@/components/shared/Button/Button';
import DropdownSelect from '@/components/shared/DropdownSelect/DropdownSelect';

import { useRecords } from '@/hooks/useRecords';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import {
  RANGE_OPTIONS,
  useRecordChartRange,
} from '@/hooks/useRecordChartRange';

import {
  formatDate,
  formatLongDate,
  parseDateValue,
  toSeoulInputDate,
} from '@/utils/dateUtils';
import { calc1RM } from '@/utils/recordUtils';
import { COLORS } from '../../constants/strengthStandards';

import { StrengthRecord } from '@/types/record';

import ChartState from '../ChartState/ChartState';

import styles from './RecordChart.module.scss';

type RecordChartProps = {
  userId?: string;
  isActive?: boolean;
  onHasDataChange?: (hasData: boolean) => void;
};

type ChartDataPoint = StrengthRecord & {
  fullDate: string;
  xKey: string;
  timestamp: number;
  squat_1rm: number;
  deadlift_1rm: number;
  bench_press_1rm: number;
  ohp_1rm: number;
  total_1rm: number;
};

type ChartPart = {
  key: keyof StrengthRecord;
  rmKey: keyof ChartDataPoint;
  label: string;
  color: string;
};

const PARTS: ChartPart[] = [
  {
    key: 'total_weight',
    rmKey: 'total_1rm',
    label: 'Total',
    color: COLORS.total_weight,
  },
  {
    key: 'squat',
    rmKey: 'squat_1rm',
    label: '스쿼트',
    color: COLORS.squat,
  },
  {
    key: 'deadlift',
    rmKey: 'deadlift_1rm',
    label: '데드',
    color: COLORS.deadlift,
  },
  {
    key: 'bench_press',
    rmKey: 'bench_press_1rm',
    label: '벤치',
    color: COLORS.bench_press,
  },
  { key: 'ohp', rmKey: 'ohp_1rm', label: 'OHP', color: COLORS.ohp },
];

type ChartTooltipProps = {
  active?: boolean;
  payload?: Payload<ValueType, NameType>[];
  activePart: ChartPart;
  show1RM: boolean;
};

function ChartTooltip({
  active,
  payload,
  activePart,
  show1RM,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

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

function buildChartData(
  records: StrengthRecord[],
  activePart: ChartPart,
): ChartDataPoint[] {
  return records
    .map((record) => ({
      record,
      date: parseDateValue(record.recorded_at || record.created_at),
      createdAt: parseDateValue(record.created_at),
    }))
    .filter(({ record, date }) => {
      if (Number.isNaN(date.getTime())) return false;
      if (activePart.key === 'total_weight') {
        return (
          record.squat > 0 && record.deadlift > 0 && record.bench_press > 0
        );
      }
      const value = record[activePart.key];
      return typeof value === 'number' && value > 0;
    })
    .sort((a, b) => {
      const timeDifference = a.date.getTime() - b.date.getTime();
      if (timeDifference !== 0) return timeDifference;

      const createdAtA = a.createdAt.getTime();
      const createdAtB = b.createdAt.getTime();
      const sortableCreatedAtA = Number.isNaN(createdAtA) ? 0 : createdAtA;
      const sortableCreatedAtB = Number.isNaN(createdAtB) ? 0 : createdAtB;
      return sortableCreatedAtA - sortableCreatedAtB;
    })
    .map(({ record, date }) => {
      const squat1rm = calc1RM(record.squat, record.squat_reps ?? 1);
      const deadlift1rm = calc1RM(record.deadlift, record.deadlift_reps ?? 1);
      const benchPress1rm = calc1RM(
        record.bench_press,
        record.bench_press_reps ?? 1,
      );
      const ohp1rm = record.ohp ? calc1RM(record.ohp, record.ohp_reps ?? 1) : 0;

      return {
        ...record,
        fullDate: formatLongDate(date),
        xKey: record.recorded_at
          ? `${record.recorded_at}_${record.created_at}`
          : record.created_at,
        timestamp: date.getTime(),
        squat_1rm: squat1rm,
        deadlift_1rm: deadlift1rm,
        bench_press_1rm: benchPress1rm,
        ohp_1rm: ohp1rm,
        total_1rm: squat1rm + deadlift1rm + benchPress1rm,
      };
    });
}

function formatAxisDate(value: string, data: ChartDataPoint[]) {
  const index = data.findIndex((point) => point.xKey === value);
  const isEndpoint = index === 0 || index === data.length - 1;
  if (data.length > 5 && !isEndpoint) return '';

  const [year, month, day] = toSeoulInputDate(
    parseDateValue(value.split('_')[0]),
  ).split('-');
  const fullDate = `${year.slice(-2)}. ${month}. ${day}`;
  if (isEndpoint) return fullDate;
  if (data.length <= 5) return `${Number(month)}/${Number(day)}`;
  return fullDate;
}

export default function RecordChart({
  userId,
  isActive = true,
  onHasDataChange,
}: RecordChartProps) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  const { data: records = [], isLoading: recordsLoading } =
    useRecords(targetId);
  const { data: profile, isLoading: profileLoading } = useProfile(targetId);

  const [activePart, setActivePart] = useState<ChartPart>(PARTS[0]);
  const isReadOnly = !!userId;
  const displayName = profile?.nickname || '';

  const [show1RM, setShow1RM] = useState(false);
  const isPageLoading = recordsLoading || (isReadOnly && profileLoading);

  const chartData = useMemo(
    () => buildChartData(records, activePart),
    [records, activePart],
  );
  const rangeControls = useRecordChartRange(chartData);
  const {
    range,
    rangePreset,
    isDatePickerOpen,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    isGestureActive,
    visibleData,
    activeRangeLabel,
    maxSelectableDate,
    setPresetRange,
    applyCustomRange,
    shiftRange,
    jumpRange,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    handlePointerDown,
    handlePointerMove,
    handlePointerEnd,
    handlePointerCancel,
    handlePointerLeave,
    handleClickCapture,
  } = rangeControls;

  const getSeriesValue = useCallback(
    (entry: ChartDataPoint) => {
      const value = show1RM ? entry[activePart.rmKey] : entry[activePart.key];
      return typeof value === 'number' && value !== 0 ? value : null;
    },
    [show1RM, activePart],
  );

  useEffect(() => {
    if (!isPageLoading) {
      onHasDataChange?.(chartData.length >= 2);
    }
  }, [isPageLoading, chartData.length, onHasDataChange]);

  return (
    <div className={styles.container}>
      {!isPageLoading && records.length >= 2 && (
        <>
          <div className={styles.btnGroup}>
            {PARTS.map((part) => {
              const isSelected = activePart.key === part.key;
              return (
                <Button
                  type='button'
                  key={part.key}
                  variant='toggle'
                  size='md'
                  shape='round'
                  active={isSelected}
                  onClick={() => setActivePart(part)}
                  className={styles.partBtn}
                  style={
                    { '--active-color': part.color } as React.CSSProperties
                  }
                >
                  {part.label}
                </Button>
              );
            })}
          </div>

          <div className={styles.viewControls}>
            <div className={styles.rmToggleWrapper}>
              <div className={styles.rmToggle}>
                <button
                  type='button'
                  aria-pressed={!show1RM}
                  className={`${styles.rmToggleBtn} ${!show1RM ? styles.rmActive : ''}`}
                  onClick={() => setShow1RM(false)}
                >
                  실제 무게
                </button>
                <button
                  type='button'
                  aria-pressed={show1RM}
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
            <div className={styles.rangeControls}>
              <DropdownSelect
                value={rangePreset}
                options={RANGE_OPTIONS.map(({ key, label }) => ({
                  value: key,
                  label,
                }))}
                onChange={setPresetRange}
                ariaLabel='차트 기간 선택'
                displayLabel={activeRangeLabel}
              />
              {isDatePickerOpen && (
                <div className={styles.dateRangeRow}>
                  <div className={styles.dateRange}>
                    <input
                      aria-label='시작일'
                      type='date'
                      max={maxSelectableDate}
                      value={customStart}
                      onChange={(event) => setCustomStart(event.target.value)}
                    />
                    <span>—</span>
                    <input
                      aria-label='종료일'
                      type='date'
                      max={maxSelectableDate}
                      value={customEnd}
                      onChange={(event) => setCustomEnd(event.target.value)}
                    />
                    <Button
                      type='button'
                      variant='blue'
                      size='sm'
                      className={styles.applyDateButton}
                      onClick={applyCustomRange}
                    >
                      적용
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className={styles.contentWrapper}>
        <ChartState
          isLoading={isPageLoading}
          loadingMessage='차트 데이터를 분석하고 있어요!'
          empty={
            chartData.length < 2
              ? {
                  message: isReadOnly
                    ? `${displayName}님의 차트 데이터가 부족합니다.`
                    : '최소 2개 이상의 기록이 필요합니다.',
                  subMessage: isReadOnly
                    ? '아직 등록된 기록이 충분하지 않아요.'
                    : '오늘의 운동을 기록하고 성장 곡선을 확인해보세요!',
                }
              : null
          }
        >
          {/* 차트 */}
          <div
            className={styles.chartArea}
            onTouchStartCapture={handleTouchStart}
            onTouchMoveCapture={handleTouchMove}
            onTouchEndCapture={handleTouchEnd}
            onTouchCancelCapture={handleTouchCancel}
            onPointerDownCapture={handlePointerDown}
            onPointerMoveCapture={handlePointerMove}
            onPointerUpCapture={handlePointerEnd}
            onPointerCancelCapture={handlePointerCancel}
            onPointerLeave={handlePointerLeave}
            onClickCapture={handleClickCapture}
          >
            {isActive && (
              <ResponsiveContainer
                width='100%'
                height='100%'
                initialDimension={{ width: 320, height: 200 }}
              >
                <ComposedChart
                  data={visibleData}
                  className={styles.chartWrapper}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    vertical={false}
                    className={styles.chartGrid}
                  />
                  <XAxis
                    dataKey='xKey'
                    interval='preserveStartEnd'
                    tickFormatter={(value: string) =>
                      formatAxisDate(value, visibleData)
                    }
                    tick={{ className: styles.chartTick }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    domain={['dataMin - 10', 'dataMax + 10']}
                    tick={{ className: styles.chartTick }}
                    tickLine={false}
                    axisLine={false}
                    unit='kg'
                    width={45}
                  />
                  <Tooltip
                    active={isGestureActive ? false : undefined}
                    content={
                      <ChartTooltip activePart={activePart} show1RM={show1RM} />
                    }
                  />
                  <Area
                    type='monotone'
                    connectNulls={false}
                    dataKey={getSeriesValue}
                    stroke='none'
                    fill={activePart.color}
                    fillOpacity={0.2}
                    baseValue='dataMin'
                    pointerEvents='none'
                    isAnimationActive={false}
                    tooltipType='none'
                  />
                  <Line
                    name={activePart.label}
                    type='monotone'
                    connectNulls={false}
                    dataKey={getSeriesValue}
                    stroke={activePart.color}
                    strokeWidth={3}
                    dot={{ r: 4, fill: activePart.color, strokeWidth: 0 }}
                    activeDot={
                      isGestureActive ? false : { r: 6, strokeWidth: 0 }
                    }
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          <p className={styles.gestureHint}>
            두 손가락으로 확대·축소하고 한 손가락으로 좌우 이동할 수 있어요.
          </p>
          <div className={styles.rangeFooter}>
            <div className={styles.rangeNavGroup}>
              <button
                type='button'
                aria-label='맨 앞 기록 범위'
                onClick={() => jumpRange('start')}
                disabled={range.startIndex === 0}
              >
                <ChevronsLeft size={18} />
              </button>
              <button
                type='button'
                aria-label='이전 기록 범위'
                onClick={() => shiftRange(-1)}
                disabled={range.startIndex === 0}
              >
                <ChevronLeft size={18} />
              </button>
            </div>
            <div className={styles.rangeSummary}>
              <span className={styles.rangeCount}>
                {visibleData.length}개 기록
              </span>
              <span className={styles.rangeDate}>
                {visibleData.length
                  ? `${formatDate(new Date(visibleData[0].timestamp))} - ${formatDate(new Date(visibleData[visibleData.length - 1].timestamp))}`
                  : '기록 없음'}
              </span>
            </div>
            <div className={styles.rangeNavGroup}>
              <button
                type='button'
                aria-label='다음 기록 범위'
                onClick={() => shiftRange(1)}
                disabled={range.endIndex >= chartData.length - 1}
              >
                <ChevronRight size={18} />
              </button>
              <button
                type='button'
                aria-label='맨 뒤 기록 범위'
                onClick={() => jumpRange('end')}
                disabled={range.endIndex >= chartData.length - 1}
              >
                <ChevronsRight size={18} />
              </button>
            </div>
          </div>
        </ChartState>
      </div>
    </div>
  );
}
