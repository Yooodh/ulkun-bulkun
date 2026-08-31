'use client';

import { useState, useRef, TouchEvent } from 'react';
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

const SWIPE_THRESHOLD_RATIO = 0.25;
const DRAG_START_THRESHOLD_PX = 8;

export default function Home() {
  const { user, loading } = useAuth();
  const [activeMobilePanel, setActiveMobilePanel] =
    useState<MobilePanel>('record');

  const viewportRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const viewportWidth = useRef(0);

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const switchPanel = (panel: MobilePanel) => {
    setActiveMobilePanel(panel);
    setDragOffset(0);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!viewportRef.current) return;
    touchStartX.current = e.touches[0].clientX;
    viewportWidth.current = viewportRef.current.offsetWidth;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const rawDelta = e.touches[0].clientX - touchStartX.current;

    if (!isDragging && Math.abs(rawDelta) > DRAG_START_THRESHOLD_PX) {
      setIsDragging(true);
    }

    let delta = rawDelta;

    if (activeMobilePanel === 'record') {
      delta = Math.min(0, Math.max(delta, -viewportWidth.current));
    } else {
      delta = Math.max(0, Math.min(delta, viewportWidth.current));
    }

    setDragOffset(delta);
  };

  const handleTouchEnd = () => {
    const width = viewportWidth.current || 1;
    const threshold = width * SWIPE_THRESHOLD_RATIO;

    if (activeMobilePanel === 'record' && dragOffset < -threshold) {
      switchPanel('profile');
    } else if (activeMobilePanel === 'profile' && dragOffset > threshold) {
      switchPanel('record');
    } else {
      setDragOffset(0);
    }

    touchStartX.current = null;
    setIsDragging(false);
  };

  if (loading) return null;

  const basePercent = activeMobilePanel === 'record' ? 0 : -50;
  const offsetPercent = viewportWidth.current
    ? (dragOffset / viewportWidth.current) * 50
    : 0;

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
              onClick={() => switchPanel('record')}
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
              onClick={() => switchPanel('profile')}
              role='tab'
              aria-selected={activeMobilePanel === 'profile'}
            >
              <UserRound size={16} />
              프로필
            </Button>
          </div>

          <div
            className={styles.mobileSliderViewport}
            ref={viewportRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={`${styles.mobileSliderTrack} ${
                isDragging ? styles.dragging : ''
              }`}
              style={{
                transform: `translateX(calc(${basePercent}% + ${offsetPercent}%))`,
              }}
            >
              <div className={styles.mobileSlide}>
                <RecordForm />
              </div>
              <div className={styles.mobileSlide}>
                <ProfileCard />
              </div>
            </div>
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
