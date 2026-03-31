'use client';

import { Edit, Share2, Bell, Eye, EyeOff } from 'lucide-react';

import styles from './ActionsSection.module.scss';

import Button from '@/components/shared/Button/Button';

type ActionsSectionProps = {
  onShare?: () => void;
  onEditProfile?: () => void;
  onTogglePublic?: () => void;
  isPublic?: boolean;
  readOnly?: boolean;
};

export default function ActionsSection({
  onShare,
  onEditProfile,
  onTogglePublic,
  isPublic,
  readOnly,
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

      {!readOnly && (
        <>
          <Button variant='outline' disabled>
            <Bell size={16} strokeWidth={2} />
            알림
          </Button>

          <Button variant='outline' onClick={onTogglePublic}>
            {isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
            {isPublic ? '공개' : '비공개'}
          </Button>
        </>
      )}
    </section>
  );
}
