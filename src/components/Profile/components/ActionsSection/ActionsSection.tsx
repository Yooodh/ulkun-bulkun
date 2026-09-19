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
  SunIcon,
  MoonIcon,
} from 'lucide-react';

import styles from './ActionsSection.module.scss';

import Button from '@/components/shared/Button/Button';

type ActionsSectionProps = {
  onShare?: () => void;
  onEditProfile?: () => void;
  onTogglePublic?: () => void;
  onSubscribe?: () => void;
  onToggleNotification?: () => void;
  onToggleDarkMode?: () => void;
  isPublic?: boolean;
  isSubscribed?: boolean;
  isNotificationOn?: boolean;
  isDarkMode?: boolean;
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
  onToggleDarkMode,
  isPublic,
  isSubscribed,
  isNotificationOn,
  isDarkMode,
  readOnly,
  isMyProfile,
  isLoggedIn,
}: ActionsSectionProps) {
  return (
    <section className={styles.actionContainer}>
      {!readOnly && (
        <Button
          variant='outline'
          shape='round'
          onClick={onEditProfile}
          aria-label='프로필 수정'
        >
          <Edit size={16} strokeWidth={2} />
        </Button>
      )}

      <Button
        variant='outline'
        shape='round'
        onClick={onShare}
        aria-label='공유'
      >
        <Share2 size={16} strokeWidth={2} />
      </Button>

      {readOnly && !isMyProfile && isLoggedIn && (
        <Button
          variant='outline'
          shape='round'
          active={isSubscribed}
          onClick={onSubscribe}
          aria-label={isSubscribed ? '팔로우 취소' : '팔로우'}
        >
          {isSubscribed ? (
            <UserRoundCheck size={16} strokeWidth={2} />
          ) : (
            <UserRoundPlus size={16} strokeWidth={2} />
          )}
        </Button>
      )}

      {!readOnly && (
        <>
          <Button
            variant='outline'
            shape='round'
            active={isDarkMode}
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {isDarkMode ? (
              <MoonIcon size={16} strokeWidth={2} />
            ) : (
              <SunIcon size={16} strokeWidth={2} />
            )}
          </Button>

          <Button
            variant='outline'
            shape='round'
            active={isPublic}
            onClick={onTogglePublic}
            aria-label={isPublic ? '비공개로 전환' : '공개로 전환'}
          >
            {isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
          </Button>

          <Button
            variant='outline'
            shape='round'
            active={isNotificationOn}
            onClick={onToggleNotification}
            aria-label={isNotificationOn ? '알림 끄기' : '알림 켜기'}
          >
            {isNotificationOn ? (
              <Bell size={16} strokeWidth={2} />
            ) : (
              <BellOff size={16} strokeWidth={2} />
            )}
          </Button>
        </>
      )}
    </section>
  );
}
