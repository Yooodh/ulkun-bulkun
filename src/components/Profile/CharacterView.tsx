'use client';

import styles from './Profile.module.scss';

import Empty from '../shared/Empty/Empty';

export default function CharacterView() {
  return (
    <div className={styles.characterSection}>
      <div>
        <Empty
          message='조금만 기다려주세요.'
          subMessage='곧 나만의 캐릭터를 만나보실 수 있어요.'
        />
        {/* <Canvas /> */}
      </div>
    </div>
  );
}
