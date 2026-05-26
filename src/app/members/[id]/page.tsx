'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

import styles from './MemberDetail.module.scss';

import RecordChart from '@/components/RecordChart/RecordChart';
import RecordList from '@/components/RecordList/RecordList';
import ProfileCard from '@/components/Profile';

import NavBar from '@/components/shared/NavBar/NavBar';
import Empty from '@/components/shared/Empty/Empty';

import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const { user: currentUser } = useAuth();
  const { data: profile, isLoading: loading } = useProfile(userId);

  const isMyPage = currentUser?.id === userId;

  useEffect(() => {
    if (!loading && profile && !isMyPage && profile.is_public === false) {
      toast.info('비공개 설정된 사용자입니다.');
      router.push('/members');
    }
  }, [loading, profile, isMyPage, router]);

  if (!userId) return <Empty message='유저 정보를 찾을 수 없습니다.' />;
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

      <div className={styles.contents}>
        <ProfileCard userId={userId} readOnly={true} />
        <RecordChart userId={userId} />
        <RecordList userId={userId} />
      </div>
    </div>
  );
}
