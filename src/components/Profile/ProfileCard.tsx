'use client';

import styles from './Profile.module.scss';

import CharacterView from './CharacterView';

export default function ProfileCard() {
  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCharacter}>
        <CharacterView />
      </div>
    </div>
  );
}
