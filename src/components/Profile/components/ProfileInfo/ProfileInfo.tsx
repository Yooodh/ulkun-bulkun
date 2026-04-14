'use client';

import Image from 'next/image';

import styles from './ProfileInfo.module.scss';

type ProfileInfoProps = {
  nickname: string;
  avatarUrl: string | null | undefined;
  status: string;
};

export default function ProfileInfo({
  nickname,
  avatarUrl,
  status,
}: ProfileInfoProps) {
  const hasAvatar = avatarUrl && avatarUrl.trim() !== '';

  return (
    <div className={styles.infoContainer}>
      <div className={styles.avatarWrapper}>
        {hasAvatar ? (
          <Image
            src={avatarUrl}
            alt={`${nickname}님의 프로필`}
            className={styles.avatar}
            width={85}
            height={85}
            priority
            unoptimized
          />
        ) : (
          <div className={styles.defaultAvatar}>💪</div>
        )}
      </div>
      <div className={styles.nameWrapper}>
        <div className={styles.textGroup}>
          <span className={styles.subText}>{status}</span>
          <h2 className={styles.nickname}>{nickname}</h2>
        </div>
      </div>
    </div>
  );
}
