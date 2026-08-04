'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UserRoundCheck, Mars, Venus, Minus } from 'lucide-react';

import { ConfirmToast } from '@/components/shared/ConfirmToast/ConfirmToast';

import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

import { formatDate } from '@/utils/dateUtils';
import { getDisplayDate, getCombinedTotalFromUser } from '@/utils/recordUtils';

import { UserSummary } from '@/types/user';

import styles from './UserCard.module.scss';

type UserCardProps = {
  user: UserSummary;
  isSubscribed?: boolean;
};

function GenderBadge({ gender }: { gender: 'male' | 'female' | null }) {
  if (gender === 'male') {
    return (
      <span className={`${styles.genderBadge} ${styles.male}`}>
        <Mars size={12} strokeWidth={2.5} />
      </span>
    );
  }

  if (gender === 'female') {
    return (
      <span className={`${styles.genderBadge} ${styles.female}`}>
        <Venus size={12} strokeWidth={2.5} />
      </span>
    );
  }

  return (
    <span className={`${styles.genderBadge} ${styles.unknown}`}>
      <Minus size={12} strokeWidth={2.5} />
    </span>
  );
}

export default function UserCard({ user, isSubscribed }: UserCardProps) {
  const isPrivate = user.is_public === false;

  const { user: currentUser } = useAuth();
  const { toggle } = useSubscription(user.id, currentUser?.id);

  const handleUnsubscribeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    ConfirmToast(`${user.nickname}님 팔로우를 취소할까요?`, () => {
      toggle();
    });
  };

  const cardContent = (
    <>
      <div className={styles.avatarWrapper}>
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.nickname}
            width={85}
            height={85}
            className={styles.avatar}
            unoptimized
          />
        ) : (
          <div className={styles.defaultAvatar}>💪</div>
        )}
      </div>

      <div className={styles.userInfo}>
        <p className={styles.statusMessage}>{user.status_message}</p>
        <h3 className={styles.userName}>
          {isSubscribed && (
            <button
              type='button'
              aria-label='팔로우 취소'
              className={styles.subscribedBadgeBtn}
              onClick={handleUnsubscribeClick}
            >
              <UserRoundCheck size={18} className={styles.subscribedBadge} />
            </button>
          )}
          {user.nickname}
          <GenderBadge gender={user.gender} />
        </h3>
        <p className={styles.userStats}>
          PR:<span>{getCombinedTotalFromUser(user)}</span>
        </p>
        <p className={styles.date}>
          마지막 기록:
          <span>
            {getDisplayDate(user.is_public, user.last_activity, formatDate)}
          </span>
        </p>
      </div>
    </>
  );

  if (isPrivate) {
    return (
      <div className={`${styles.userCard} ${styles.privateCard}`}>
        <div className={styles.lockBadge}>🔒 비공개</div>
        {cardContent}
      </div>
    );
  }

  return (
    <Link href={`/members/${user.id}`} className={styles.userCard}>
      {cardContent}
    </Link>
  );
}
