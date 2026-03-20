'use client';

import styles from './page.module.scss';

import RecordForm from '@/components/RecordForm/RecordForm';
import RecordList from '@/components/RecordList/RecordList';
import RecordChart from '@/components/RecordChart/RecordChart';
import ProfileCard from '@/components/Profile';

import Empty from '@/components/shared/Empty/Empty';
import NavBar from '@/components/shared/NavBar/NavBar';

import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <div className={styles.pageContainer}>
      <NavBar href='/members' label='🔥 울끈불끈이들 기록 보러가기 🔥' />

      <div className={`${styles.dashboardGrid} ${!user ? styles.isGuest : ''}`}>
        <RecordForm />

        {user ? (
          <>
            <ProfileCard />
            <RecordChart />
            <RecordList />
          </>
        ) : (
          <div className={styles.guestMessage}>
            <Empty
              message='로그인 후 기록을 시작해 볼까요?'
              subMessage='나만의 운동 통계와 변화 그래프를 확인해 보세요.'
            />
          </div>
        )}
      </div>
    </div>
  );
}
