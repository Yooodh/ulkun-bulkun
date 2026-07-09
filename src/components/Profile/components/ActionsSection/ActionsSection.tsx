'use client';

import {
  Edit,
  Share2,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  UserRoundPlus,
  UserRoundCheck,
} from 'lucide-react';

import styles from './ActionsSection.module.scss';

import Button from '@/components/shared/Button/Button';

type ActionsSectionProps = {
  onShare?: () => void;
  onEditProfile?: () => void;
  onTogglePublic?: () => void;
  onSubscribe?: () => void;
  onToggleNotification?: () => void;
  isPublic?: boolean;
  isSubscribed?: boolean;
  isNotificationOn?: boolean;
  readOnly?: boolean;
  isMyProfile?: boolean;
  isLoggedIn?: boolean;
};

export default function ActionsSection({
  onShare,
  onEditProfile,
  onTogglePublic,
  onSubscribe,
  onToggleNotification,
  isPublic,
  isSubscribed,
  isNotificationOn,
  readOnly,
  isMyProfile,
  isLoggedIn,
}: ActionsSectionProps) {
  return (
    <section className={styles.actionContainer}>
      {!readOnly && (
        <Button variant='outline' onClick={onEditProfile}>
          <Edit size={16} strokeWidth={2} />
          수정
        </Button>
      )}

      <Button variant='outline' onClick={onShare}>
        <Share2 size={16} strokeWidth={2} />
        공유
      </Button>

      {readOnly && !isMyProfile && isLoggedIn && (
        <Button variant='outline' active={isSubscribed} onClick={onSubscribe}>
          {isSubscribed ? (
            <UserRoundCheck size={16} strokeWidth={2} />
          ) : (
            <UserRoundPlus size={16} strokeWidth={2} />
          )}
          {isSubscribed ? '팔로잉' : '팔로우'}
        </Button>
      )}

      {!readOnly && (
        <>
          <Button variant='outline' active={isPublic} onClick={onTogglePublic}>
            {isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
            {isPublic ? '공개' : '비공개'}
          </Button>

          <Button
            variant='outline'
            active={isNotificationOn}
            onClick={onToggleNotification}
          >
            {isNotificationOn ? (
              <Bell size={16} strokeWidth={2} />
            ) : (
              <BellOff size={16} strokeWidth={2} />
            )}
            {isNotificationOn ? '알림 켬' : '알림 끔'}
          </Button>
        </>
      )}
    </section>
  );
}
