import Link from 'next/link';
import Image from 'next/image';
import { UserRoundCheck } from 'lucide-react';

import styles from './UserCard.module.scss';

import { UserSummary } from '@/types/user';

import { formatDate } from '@/utils/dateUtils';
import { getDisplayDate, getCombinedTotalFromUser } from '@/utils/recordUtils';

type UserCardProps = {
  user: UserSummary;
  isSubscribed?: boolean;
};

export default function UserCard({ user, isSubscribed }: UserCardProps) {
  const isPrivate = user.is_public === false;

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
          {user.nickname}
          {isSubscribed && (
            <UserRoundCheck size={18} className={styles.subscribedBadge} />
          )}
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
