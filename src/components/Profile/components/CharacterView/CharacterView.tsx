'use client';

import styles from './CharacterView.module.scss';

import Empty from '@/components/shared/Empty/Empty';
import Loading from '@/components/shared/Loading/Loading';

type CharacterViewProps = {
  isLoading?: boolean;
};

export default function CharacterView({ isLoading }: CharacterViewProps) {
  return (
    <div className={styles.characterContainer}>
      <div>
        {isLoading ? (
          <Loading message='캐릭터를 불러오고 있어요!' />
        ) : (
          <Empty
            message='조금만 기다려주세요.'
            subMessage='곧 나만의 캐릭터를 만나보실 수 있어요.'
          />
        )}
        {/* <Canvas /> */}
      </div>
    </div>
  );
}
