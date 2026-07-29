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
  const [hasData, setHasData] = useState<Record<ChartView, boolean>>({
    record: true,
    strength: true,
    bodyweight: true,
  });

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
          onClick={() => setActiveView(tab.key)}
        >
          {tab.icon}
        </button>
      ))}
    </div>
  );

  return (
    <div className={styles.chartsWrapper}>
      <div
        className={`${styles.chartPane} ${!hasData.record ? styles.auto : ''}`}
        style={{ display: activeView === 'record' ? 'block' : 'none' }}
      >
        <RecordChart
          userId={userId}
          tabButtons={tabButtons}
          onHasDataChange={handleHasDataChange('record')}
        />
      </div>
      <div
        className={`${styles.chartPane} ${!hasData.strength ? styles.auto : ''}`}
        style={{ display: activeView === 'strength' ? 'block' : 'none' }}
      >
        <StrengthChart
          userId={userId}
          tabButtons={tabButtons}
          onHasDataChange={handleHasDataChange('strength')}
        />
      </div>
      <div
        className={`${styles.chartPane} ${!hasData.bodyweight ? styles.auto : ''}`}
        style={{ display: activeView === 'bodyweight' ? 'block' : 'none' }}
      >
        <BodyweightChart
          userId={userId}
          tabButtons={tabButtons}
          onHasDataChange={handleHasDataChange('bodyweight')}
        />
      </div>
    </div>
  );
}
