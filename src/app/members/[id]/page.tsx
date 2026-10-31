'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

import NavBar from '@/components/shared/NavBar/NavBar';
import Empty from '@/components/shared/Empty/Empty';

import Charts from '@/components/Charts';
import ProfileCard from '@/components/Profile';
import RecordList from '@/components/RecordList/RecordList';

import { useProfile, useProfileByNickname } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

import styles from './MemberDetail.module.scss';

function decodeMemberSlug(slug: string | undefined): string | undefined {
  if (!slug) return slug;

  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memberSlug = decodeMemberSlug(params?.id as string | undefined);
  const isLegacyUserId =
    !!memberSlug &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      memberSlug,
    );

  const { user: currentUser } = useAuth();
  const { data: profileById, isLoading: isLoadingById } = useProfile(
    isLegacyUserId ? memberSlug : undefined,
  );
  const { data: profileByNickname, isLoading: isLoadingByNickname } =
    useProfileByNickname(isLegacyUserId ? undefined : memberSlug);
  const profile = profileById ?? profileByNickname;
  const loading = isLoadingById || isLoadingByNickname;
  const userId = profile?.id;

  const isMyPage = currentUser?.id === userId;

  useEffect(() => {
    if (isLegacyUserId && profile) {
      router.replace(`/members/${encodeURIComponent(profile.nickname)}`);
    }
  }, [isLegacyUserId, profile, router]);

  useEffect(() => {
    if (!loading && profile && !isMyPage && profile.is_public === false) {
      toast.info('비공개 설정된 사용자입니다.', { id: 'member-private' });
      router.push('/members');
    }
  }, [loading, profile, isMyPage, router]);

  if (!memberSlug || (!loading && !profile)) {
    return (
      <div className={styles.MemberDetailContainer}>
        <header className={styles.header}>
          <div className={styles.navGroup}>
            <NavBar href='/members' label='뒤로가기' />
            <div className={styles.title} />
            <NavBar href='/' label='대시보드로 돌아가기' />
          </div>
        </header>
        <div className={styles.contents}>
          <Empty fullHeight={true} message='유저 정보를 찾을 수 없습니다.' />
        </div>
      </div>
    );
  }
  if (!isMyPage && profile?.is_public === false) return null;

  return (
    <div className={styles.MemberDetailContainer}>
      <header className={styles.header}>
        <div className={styles.navGroup}>
          <NavBar href='/members' label='뒤로가기' />
          <h1 className={styles.title}>
            {loading ? (
              '울끈불끈이 입장 중!'
            ) : (
              <>
                <strong className={styles.nickname}>{profile?.nickname}</strong>{' '}
                님의 상세 기록
              </>
            )}
          </h1>
          <NavBar href='/' label='대시보드로 돌아가기' />
        </div>
      </header>

      {userId && (
        <div className={styles.contents}>
          <ProfileCard userId={userId} readOnly={true} />
          <Charts userId={userId} />
          <RecordList userId={userId} />
        </div>
      )}
    </div>
  );
}
