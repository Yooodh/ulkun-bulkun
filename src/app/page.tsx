'use client';

import { useState } from 'react';
import { ClipboardList, UserRound } from 'lucide-react';

import Empty from '@/components/shared/Empty/Empty';
import NavBar from '@/components/shared/NavBar/NavBar';
import Button from '@/components/shared/Button/Button';

import RecordForm from '@/components/RecordForm/RecordForm';
import RecordList from '@/components/RecordList/RecordList';
import Charts from '@/components/Charts';
import ProfileCard from '@/components/Profile';

import { useAuth } from '@/hooks/useAuth';

import styles from './page.module.scss';

type MobilePanel = 'record' | 'profile';

export default function Home() {
  const { user, loading } = useAuth();
  const [activeMobilePanel, setActiveMobilePanel] =
    useState<MobilePanel>('record');

  if (loading) return null;

  return (
    <div className={styles.pageContainer}>
      <NavBar href='/members' label='🔥 울끈불끈이들 기록 보러가기 🔥' />

      {user ? (
        <div className={styles.dashboardGrid}>
          <div
            className={styles.mobileSwitcher}
            role='tablist'
            aria-label='모바일 대시보드 전환'
          >
            <Button
              type='button'
              variant='outline'
              size='sm'
              active={activeMobilePanel === 'record'}
              onClick={() => setActiveMobilePanel('record')}
              role='tab'
              aria-selected={activeMobilePanel === 'record'}
            >
              <ClipboardList size={16} />
              기록
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              active={activeMobilePanel === 'profile'}
              onClick={() => setActiveMobilePanel('profile')}
              role='tab'
              aria-selected={activeMobilePanel === 'profile'}
            >
              <UserRound size={16} />
              프로필
            </Button>
          </div>
          <div
            className={`${styles.mobilePanel} ${
              activeMobilePanel === 'record' ? styles.activeMobilePanel : ''
            }`}
          >
            <RecordForm />
          </div>
          <div
            className={`${styles.mobilePanel} ${
              activeMobilePanel === 'profile' ? styles.activeMobilePanel : ''
            }`}
          >
            <ProfileCard />
          </div>
          <Charts />
          <RecordList />
        </div>
      ) : (
        <div className={styles.guestGrid}>
          <RecordForm />
          <div className={styles.guestMessage}>
            <Empty
              message='로그인 후 기록을 시작해 볼까요?'
              subMessage='나만의 운동 통계와 변화 그래프를 확인해 보세요.'
            />
          </div>
        </div>
      )}
    </div>
  );
}
