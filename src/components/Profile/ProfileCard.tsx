'use client';

import { useState } from 'react';

import styles from './Profile.module.scss';

import CharacterView from './CharacterView';
import ProfileEdit from './ProfileEdit';
import ProfileInfo from './ProfileInfo';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

import Loading from '../shared/Loading/Loading';

type ProfileCardProps = {
  userId?: string;
  readOnly?: boolean;
};

type DrawerStage = 1 | 2;

export default function ProfileCard({
  userId,
  readOnly = false,
}: ProfileCardProps) {
  const { user } = useAuth();

  const targetId = userId || user?.id;
  const { profile, loading, setProfile } = useProfile(targetId);

  const [stage, setStage] = useState<DrawerStage>(1);

  const isMyProfile = !userId || userId === user?.id;
  const canEdit = isMyProfile && user && !readOnly;

  const handleUpdate = (
    nickname: string,
    avatar_url: string,
    status_message: string,
  ) => {
    if (setProfile) {
      setProfile({ nickname, avatar_url, status_message });
    }
  };

  const cycleStage = () => {
    if (readOnly) return;
    setStage((prev) => (prev === 1 ? 2 : 1));
  };

  if (loading) return <Loading message='프로필 정보를 불러오고 있어요!' />;
  if (!profile) return <Loading message='프로필 정보를 불러올 수 없습니다.' />;

  return (
    <div className={styles.profileWrapper}>
      <div className={styles.characterSection}>
        <CharacterView />
      </div>

      <div className={`${styles.infoCard} ${styles[`stage${stage}`]}`}>
        <div
          className={styles.handle}
          onClick={!readOnly ? cycleStage : undefined}
        >
          {!readOnly && <div className={styles.handleBar} />}
        </div>

        <div className={styles.profileContent}>
          {canEdit ? (
            <ProfileEdit
              user={user}
              initialNickname={profile.nickname}
              initialAvatar={profile.avatar_url || ''}
              initialStatus={profile.status_message || ''}
              onUpdate={handleUpdate}
            />
          ) : (
            <ProfileInfo
              nickname={profile.nickname}
              avatarUrl={profile.avatar_url || ''}
              status={profile.status_message || ''}
            />
          )}
        </div>
      </div>
    </div>
  );
}
