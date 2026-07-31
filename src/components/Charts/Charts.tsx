'use client';

import { useState } from 'react';
import { LineChart, Radar, Weight } from 'lucide-react';

import RecordChart from './components/RecordChart/RecordChart';
import StrengthChart from './components/StrengthChart/StrengthChart';
import BodyweightChart from './components/BodyweightChart/BodyweightChart';

import styles from './Charts.module.scss';

type ChartsProps = { userId?: string };
type ChartView = 'record' | 'strength' | 'bodyweight';

const TABS: { key: ChartView; label: string; icon: React.ReactNode }[] = [
  { key: 'record', label: '성장 곡선', icon: <LineChart size={20} /> },
  { key: 'strength', label: '밸런스 분석', icon: <Radar size={20} /> },
  { key: 'bodyweight', label: '체중 대비', icon: <Weight size={20} /> },
];

export default function Charts({ userId }: ChartsProps) {
  const [activeView, setActiveView] = useState<ChartView>('record');
  const [mountedViews, setMountedViews] = useState<Record<ChartView, boolean>>({
    record: true,
    strength: false,
    bodyweight: false,
  });
  const [hasData, setHasData] = useState<Record<ChartView, boolean>>({
    record: true,
    strength: true,
    bodyweight: true,
  });

  const handleTabClick = (view: ChartView) => {
    setActiveView(view);
    setMountedViews((prev) =>
      prev[view] ? prev : { ...prev, [view]: true },
    );
  };

  const handleHasDataChange = (view: ChartView) => (value: boolean) => {
    setHasData((prev) =>
      prev[view] === value ? prev : { ...prev, [view]: value },
    );
  };

  const tabButtons = (
    <div className={styles.tabGroup}>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type='button'
          className={`${styles.tabBtn} ${activeView === tab.key ? styles.active : ''}`}
          onClick={() => handleTabClick(tab.key)}
        >
          {tab.icon}
        </button>
      ))}
    </div>
  );

  return (
    <div className={styles.chartsWrapper}>
      {mountedViews.record && (
        <div
          className={`${styles.chartPane} ${
            activeView === 'record' ? styles.active : styles.inactive
          } ${!hasData.record ? styles.auto : ''}`}
        >
          <RecordChart
            userId={userId}
            tabButtons={tabButtons}
            onHasDataChange={handleHasDataChange('record')}
          />
        </div>
      )}

      {mountedViews.strength && (
        <div
          className={`${styles.chartPane} ${
            activeView === 'strength' ? styles.active : styles.inactive
          } ${!hasData.strength ? styles.auto : ''}`}
        >
          <StrengthChart
            userId={userId}
            tabButtons={tabButtons}
            onHasDataChange={handleHasDataChange('strength')}
          />
        </div>
      )}

      {mountedViews.bodyweight && (
        <div
          className={`${styles.chartPane} ${
            activeView === 'bodyweight' ? styles.active : styles.inactive
          } ${!hasData.bodyweight ? styles.auto : ''}`}
        >
          <BodyweightChart
            userId={userId}
            tabButtons={tabButtons}
            onHasDataChange={handleHasDataChange('bodyweight')}
          />
        </div>
      )}
    </div>
  );
}
