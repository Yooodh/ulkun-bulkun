'use client';

import { useState } from 'react';
import { LineChart, Radar, Weight } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

import RecordChart from './components/RecordChart/RecordChart';
import StrengthChart from './components/StrengthChart/StrengthChart';
import BodyweightChart from './components/BodyweightChart/BodyweightChart';

import styles from './Charts.module.scss';

type ChartsProps = { userId?: string };
type ChartView = 'record' | 'strength' | 'bodyweight';

const TABS: {
  key: ChartView;
  label: string;
  title: string;
  icon: React.ReactNode;
}[] = [
  {
    key: 'record',
    label: '성장 곡선',
    title: '성장 곡선',
    icon: <LineChart size={20} />,
  },
  {
    key: 'strength',
    label: '밸런스 분석',
    title: '종목 밸런스',
    icon: <Radar size={20} />,
  },
  {
    key: 'bodyweight',
    label: '체중 대비',
    title: '체중 대비 밸런스',
    icon: <Weight size={20} />,
  },
];

export default function Charts({ userId }: ChartsProps) {
  const { user } = useAuth();
  const targetId = userId || user?.id;
  const { data: profile } = useProfile(targetId);

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
    setMountedViews((prev) => (prev[view] ? prev : { ...prev, [view]: true }));
  };

  const handleHasDataChange = (view: ChartView) => (value: boolean) => {
    setHasData((prev) =>
      prev[view] === value ? prev : { ...prev, [view]: value },
    );
  };

  const activeTab = TABS.find((tab) => tab.key === activeView) ?? TABS[0];
  const displayName = profile?.nickname || '';

  const shouldUseAutoHeight = !hasData[activeView];

  const tabButtons = (
    <div className={styles.tabGroup}>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type='button'
          className={`${styles.tabBtn} ${activeView === tab.key ? styles.active : ''}`}
          onClick={() => handleTabClick(tab.key)}
          aria-label={tab.label}
          title={tab.label}
        >
          {tab.icon}
        </button>
      ))}
    </div>
  );

  return (
    <div
      className={`${styles.container} ${
        shouldUseAutoHeight ? styles.autoContainer : ''
      }`}
    >
      <div className={styles.header}>
        <h1>
          {displayName && (
            <>
              <strong>{displayName}</strong> 님의{' '}
            </>
          )}
          {activeTab.title}
        </h1>
        {tabButtons}
      </div>

      <div
        className={`${styles.contentWrapper} ${
          shouldUseAutoHeight ? styles.auto : ''
        }`}
      >
        {mountedViews.record && (
          <div
            className={`${styles.chartPane} ${
              activeView === 'record' ? styles.active : styles.inactive
            } ${activeView === 'record' && !hasData.record ? styles.auto : ''}`}
          >
            <RecordChart
              userId={userId}
              onHasDataChange={handleHasDataChange('record')}
            />
          </div>
        )}

        {mountedViews.strength && (
          <div
            className={`${styles.chartPane} ${
              activeView === 'strength' ? styles.active : styles.inactive
            } ${
              activeView === 'strength' && !hasData.strength ? styles.auto : ''
            }`}
          >
            <StrengthChart
              userId={userId}
              onHasDataChange={handleHasDataChange('strength')}
            />
          </div>
        )}

        {mountedViews.bodyweight && (
          <div
            className={`${styles.chartPane} ${
              activeView === 'bodyweight' ? styles.active : styles.inactive
            } ${
              activeView === 'bodyweight' && !hasData.bodyweight
                ? styles.auto
                : ''
            }`}
          >
            <BodyweightChart
              userId={userId}
              onHasDataChange={handleHasDataChange('bodyweight')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
