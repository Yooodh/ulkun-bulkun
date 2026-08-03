'use client';

import Image from 'next/image';
import { Mars, Venus, Minus } from 'lucide-react';

import styles from './ProfileInfo.module.scss';

type ProfileInfoProps = {
  nickname: string;
  avatarUrl: string | null | undefined;
  status: string;
  gender?: 'male' | 'female' | null;
};

function GenderBadge({ gender }: { gender?: 'male' | 'female' | null }) {
  if (gender === 'male') {
    return (
      <span className={`${styles.genderBadge} ${styles.male}`}>
        <Mars size={14} strokeWidth={2.5} />
      </span>
    );
  }

  if (gender === 'female') {
    return (
      <span className={`${styles.genderBadge} ${styles.female}`}>
        <Venus size={14} strokeWidth={2.5} />
      </span>
    );
  }

  return (
    <span className={`${styles.genderBadge} ${styles.unknown}`}>
      <Minus size={14} strokeWidth={2.5} />
    </span>
  );
}

export default function ProfileInfo({
  nickname,
  avatarUrl,
  status,
  gender,
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
          <h2 className={styles.nickname}>
            {nickname}
            <GenderBadge gender={gender} />
          </h2>
        </div>
      </div>
    </div>
  );
}
