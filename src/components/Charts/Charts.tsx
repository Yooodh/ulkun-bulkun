'use client';

import RecordChart from './components/RecordChart/RecordChart';

import styles from './Charts.module.scss';

type ChartsProps = {
  userId?: string;
};

export default function Charts({ userId }: ChartsProps) {
  return (
    <div className={styles.chartsWrapper}>
      <RecordChart userId={userId} />
    </div>
  );
}
