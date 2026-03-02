'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import {
  ValueType,
  NameType,
  Payload,
} from 'recharts/types/component/DefaultTooltipContent';

import styles from './RecordChart.module.scss';

import Button from '../shared/Button/Button';
import Empty from '../shared/Empty/Empty';
import Loading from '../shared/Loading/Loading';

import { useRecords } from '@/hooks/useRecords';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

import { StrengthRecord } from '@/types/record';

type RecordChartProps = {
  userId?: string;
};

type ChartPart = {
  key: keyof StrengthRecord;
  label: string;
  color: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: Payload<ValueType, NameType>[];
};

type ChartDataPoint = StrengthRecord & {
  fullDate: string;
  displayValue: number;
};

const PARTS: ChartPart[] = [
  { key: 'total_weight', label: 'Total', color: '#007bff' },
  { key: 'squat', label: '스쿼트', color: '#EF4444' },
  { key: 'deadlift', label: '데드', color: '#F97316' },
  { key: 'bench_press', label: '벤치', color: '#22C55E' },
  { key: 'ohp', label: 'OHP', color: '#A855F7' },
];

export default function RecordChart({ userId }: RecordChartProps) {
  const { user } = useAuth();

  const targetId = userId || user?.id;

  const { records, loading: recordsLoading } = useRecords(targetId);
  const { profile, loading: profileLoading } = useProfile(targetId);

  const [activePart, setActivePart] = useState<ChartPart>(PARTS[0]);

  const isReadOnly = !!userId;

  const displayName = profile?.nickname || (isReadOnly ? '불끈이' : '울끈이');

  const isPageLoading = recordsLoading || (isReadOnly && profileLoading);

  const chartData = useMemo(() => {
    return [...records]
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
      .map((r) => {
        const dateObj = new Date(r.created_at);
        return {
          ...r,
          fullDate: dateObj.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          displayValue:
            typeof r[activePart.key] === 'number' ? r[activePart.key] : 0,
        };
      });
  }, [records, activePart]);

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload as ChartDataPoint;
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipDate}>{point.fullDate}</p>
          <p
            className={styles.tooltipValue}
            style={{ color: payload[0].color }}
          >
            {`${activePart.label}: ${payload[0].value}kg`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartContainer}>
      <h1>
        <strong>{displayName}</strong> 님의 성장 곡선
      </h1>

      {!isPageLoading && records.length >= 2 && (
        <div className={styles.btnGroup}>
          {PARTS.map((part) => {
            const isActive = activePart.key === part.key;

            return (
              <Button
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
      )}

      <div className={styles.contentWrapper}>
        {isPageLoading ? (
          <Loading message='차트 데이터를 분석하고 있어요!' />
        ) : records.length < 2 ? (
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
          <ResponsiveContainer width='100%' height={350}>
            <LineChart
              data={chartData}
              className={styles.chartWrapper}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                vertical={false}
                className={styles.chartGrid}
              />
              <XAxis
                dataKey='created_at'
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
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
              <Tooltip content={<CustomTooltip />} />
              <Line
                name={activePart.label}
                type='monotone'
                dataKey='displayValue'
                stroke={activePart.color}
                strokeWidth={3}
                dot={{ r: 4, fill: activePart.color, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
