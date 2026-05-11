'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import styles from './Profile.module.scss';

import CharacterView from './components/CharacterView/CharacterView';
import ProfileEdit from './components/ProfileEdit/ProfileEdit';
import ProfileInfo from './components/ProfileInfo/ProfileInfo';
import StatsSection from './components/StatsSection/StatsSection';
import ActionsSection from './components/ActionsSection/ActionsSection';

import Loading from '../shared/Loading/Loading';
import Empty from '../shared/Empty/Empty';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useRecords } from '@/hooks/useRecords';
import { useProfileUpdate } from '@/hooks/useProfileUpdate';

import { calculateTotalPR } from '@/utils/recordUtils';

type ProfileCardProps = {
  userId?: string;
  readOnly?: boolean;
};

export default function ProfileCard({
  userId,
  readOnly = false,
}: ProfileCardProps) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  const { data: profile, isLoading: loading, isFetched } = useProfile(targetId);
  const {
    records,
    loading: recordsLoading,
    isReady: recordsReady,
  } = useRecords(targetId);
  const { saveFullProfile } = useProfileUpdate(user!);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [stage, setStage] = useState<1 | 2>(1);

  const isMyProfile = !userId || userId === user?.id;
  const canEdit = isMyProfile && user && !readOnly;

  const queryClient = useQueryClient();

  // 프로필 업데이트
  const handleUpdate = async (
    nickname: string,
    avatar_url: string,
    status_message: string,
  ) => {
    if (!profile) return;
    const success = await saveFullProfile(
      nickname,
      status_message,
      avatar_url,
      profile.is_public,
    );

    if (success) {
      queryClient.invalidateQueries({ queryKey: ['profile', targetId] });
      setIsEditing(false);
    }
  };

  // 공개/비공개
  const handleTogglePublic = async () => {
    if (!profile || !canEdit) return;

    const nextPublicStatus = !profile.is_public;

    const confirmMessage = nextPublicStatus
      ? '내 기록을 공유하고 함께 운동해볼까요?'
      : '내 기록을 비밀로 유지할까요?';

    if (!confirm(confirmMessage)) return;

    const success = await saveFullProfile(
      profile.nickname,
      profile.status_message,
      profile.avatar_url,
      nextPublicStatus,
    );

    if (success) {
      queryClient.invalidateQueries({ queryKey: ['profile', targetId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });

      alert(
        nextPublicStatus
          ? '프로필이 전체 공개로 설정되었습니다.'
          : '프로필이 비공개로 설정되었습니다.',
      );
    }
  };

  const cycleStage = () => {
    if (isEditing) return;
    setStage((prev) => (prev === 1 ? 2 : 1));
  };

  // 공유
  const handleShare = async () => {
    if (!profile) return;
    const shareData = {
      title: `${profile.nickname}님의 프로필`,
      text: profile.status_message,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        alert('프로필 링크가 클립보드에 복사되었습니다!');
      }
    } catch (error) {
      console.error('공유 실패:', error);
    }
  };

  if (isFetched && !loading && !profile)
    return <Empty message='프로필 정보를 불러올 수 없어요.' />;

  const isCharacterReady = !loading && recordsReady;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.characterSection}>
        <CharacterView
          isLoading={!isCharacterReady}
          totalPR={calculateTotalPR(records)}
        />
      </div>

      <div
        className={`${styles.infoSection} ${styles[`stage${stage}`]} ${isEditing ? styles.isEditing : ''}`}
      >
        <div className={styles.infoHeader} onClick={cycleStage}>
          {!isEditing && (
            <div className={styles.handle}>
              <div className={styles.handleBar} />
            </div>
          )}

          <div className={styles.infoTitle}>
            {loading ? (
              <div className={styles.infoLoading}>
                <Loading size='sm' message='프로필 정보를 불러오고 있어요!' />
              </div>
            ) : isEditing ? (
              <div className={styles.editTitle} />
            ) : profile ? (
              <ProfileInfo
                nickname={profile.nickname}
                avatarUrl={profile.avatar_url}
                status={profile.status_message}
              />
            ) : null}
          </div>
        </div>

        <div className={styles.infoContent}>
          <div className={styles.contentBox}>
            {isEditing && profile ? (
              <ProfileEdit
                user={user!}
                initialNickname={profile.nickname}
                initialAvatar={profile.avatar_url}
                initialStatus={profile.status_message}
                initialIsPublic={profile.is_public}
                onUpdate={handleUpdate}
                onEditingChange={setIsEditing}
              />
            ) : (
              <div className={styles.contentDetails}>
                <StatsSection records={records} loading={recordsLoading} />
                <ActionsSection
                  onShare={handleShare}
                  onEditProfile={() => {
                    setStage(2);
                    setIsEditing(true);
                  }}
                  onTogglePublic={handleTogglePublic}
                  isPublic={profile?.is_public}
                  readOnly={!canEdit}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
