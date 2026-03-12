'use client';

import styles from './Profile.module.scss';

type ProfileInfoProps = {
  nickname: string;
  avatarUrl: string;
  status: string;
};

export default function ProfileInfo({
  nickname,
  avatarUrl,
  status,
}: ProfileInfoProps) {
  return (
    <div className={styles.infoContainer}>
      <div className={styles.avatarWrapper}>
        <img
          src={avatarUrl || '/default-avatar.png'}
          alt='profile'
          className={styles.avatar}
        />
      </div>
      <div className={styles.nameWrapper}>
        <div className={styles.textGroup}>
          <span className={styles.subText}>{status || '울끈불끈!'}</span>
          <h2 className={styles.nickname}>{nickname || '불끈이'}</h2>
        </div>
      </div>
    </div>
  );
}
