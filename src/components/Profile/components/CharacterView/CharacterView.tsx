'use client';

import styles from './CharacterView.module.scss';

import Canvas from './Canvas';

import Loading from '@/components/shared/Loading/Loading';

type CharacterViewProps = {
  isLoading?: boolean;
  totalPR?: number;
};

export default function CharacterView({
  isLoading,
  totalPR = 0,
}: CharacterViewProps) {
  return (
    <div className={styles.characterContainer}>
      <div>
        {isLoading ? (
          <Loading message='캐릭터를 불러오고 있어요!' />
        ) : (
          <Canvas totalPR={totalPR} />
        )}
      </div>
    </div>
  );
}
