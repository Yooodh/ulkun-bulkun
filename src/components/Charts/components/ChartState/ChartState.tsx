import type { ReactNode } from 'react';

import Loading from '@/components/shared/Loading/Loading';
import Empty from '@/components/shared/Empty/Empty';

import styles from './ChartState.module.scss';

export type ChartEmptyState = {
  message: string;
  subMessage?: string;
};

type ChartStateProps = {
  isLoading: boolean;
  loadingMessage: string;
  empty?: ChartEmptyState | null;
  children: ReactNode;
};

export default function ChartState({
  isLoading,
  loadingMessage,
  empty,
  children,
}: ChartStateProps) {
  if (isLoading) {
    return (
      <div className={styles.stateWrapper}>
        <Loading size='lg' message={loadingMessage} />
      </div>
    );
  }

  if (empty) {
    return (
      <div className={styles.stateWrapper}>
        <Empty message={empty.message} subMessage={empty.subMessage} />
      </div>
    );
  }

  return <>{children}</>;
}
