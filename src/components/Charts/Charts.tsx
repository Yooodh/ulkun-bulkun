'use client';

import { useState } from 'react';
import { LineChart, Radar, Weight } from 'lucide-react';

import RecordChart from './components/RecordChart/RecordChart';
import StrengthRadarChart from './components/StrengthRadarChart/StrengthRadarChart';
import BodyweightRadarChart from './components/BodyweightRadarChart/BodyweightRadarChart';

import styles from './Charts.module.scss';

type ChartsProps = {
  userId?: string;
};

type ChartView = 'record' | 'radar' | 'bodyweight';

const TABS: { key: ChartView; label: string; icon: React.ReactNode }[] = [
  { key: 'record', label: '성장 곡선', icon: <LineChart size={20} /> },
  { key: 'radar', label: '밸런스 분석', icon: <Radar size={20} /> },
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
      {activeView === 'radar' && (
        <StrengthRadarChart userId={userId} tabButtons={tabButtons} />
      )}
      {activeView === 'bodyweight' && (
        <BodyweightRadarChart userId={userId} tabButtons={tabButtons} />
      )}
    </div>
  );
}
