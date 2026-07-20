'use client';

import { useState } from 'react';
import { LineChart, Radar, Weight } from 'lucide-react';

import RecordChart from './components/RecordChart/RecordChart';
import StrengthChart from './components/StrengthChart/StrengthChart';
import BodyweightChart from './components/BodyweightChart/BodyweightChart';

import styles from './Charts.module.scss';

type ChartsProps = {
  userId?: string;
};

type ChartView = 'record' | 'strength' | 'bodyweight';

const TABS: { key: ChartView; label: string; icon: React.ReactNode }[] = [
  { key: 'record', label: '성장 곡선', icon: <LineChart size={20} /> },
  { key: 'strength', label: '밸런스 분석', icon: <Radar size={20} /> },
  { key: 'bodyweight', label: '체중 대비', icon: <Weight size={20} /> },
];

export default function Charts({ userId }: ChartsProps) {
  const [activeView, setActiveView] = useState<ChartView>('record');

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
      {activeView === 'record' && (
        <RecordChart userId={userId} tabButtons={tabButtons} />
      )}
      {activeView === 'strength' && (
        <StrengthChart userId={userId} tabButtons={tabButtons} />
      )}
      {activeView === 'bodyweight' && (
        <BodyweightChart userId={userId} tabButtons={tabButtons} />
      )}
    </div>
  );
}
