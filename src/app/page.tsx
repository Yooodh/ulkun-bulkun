'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  TouchEvent,
} from 'react';
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

  const [viewportEl, setViewportEl] = useState<HTMLDivElement | null>(null);
  const viewportRef = useCallback((node: HTMLDivElement | null) => {
    setViewportEl(node);
  }, []);

  const touchStartX = useRef<number | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!viewportEl) return;

    setViewportWidth(viewportEl.offsetWidth);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setViewportWidth(entry.contentRect.width);
      }
    });

    observer.observe(viewportEl);
    return () => observer.disconnect();
  }, [viewportEl]);

  const switchPanel = (panel: MobilePanel) => {
    setActiveMobilePanel(panel);
    setDragOffset(0);
  };

  const resetTouchState = useCallback(() => {
    touchStartX.current = null;
    setIsDragging(false);
    setDragOffset(0);
  }, []);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!viewportEl) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const rawDelta = e.touches[0].clientX - touchStartX.current;

    if (!isDragging && Math.abs(rawDelta) > DRAG_START_THRESHOLD_PX) {
      setIsDragging(true);
    }

    let delta = rawDelta;

    if (activeMobilePanel === 'record') {
      delta = Math.min(0, Math.max(delta, -viewportWidth));
    } else {
      delta = Math.max(0, Math.min(delta, viewportWidth));
    }

    setDragOffset(delta);
  };

  const handleTouchEnd = () => {
    const width = viewportWidth || 1;
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

  const handleTouchCancel = () => {
    resetTouchState();
  };

  const { basePercent, offsetPercent } = useMemo(() => {
    const base = activeMobilePanel === 'record' ? 0 : -50;
    const offset = viewportWidth ? (dragOffset / viewportWidth) * 50 : 0;
    return { basePercent: base, offsetPercent: offset };
  }, [activeMobilePanel, dragOffset, viewportWidth]);

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
              shape='round'
              variant='outline'
              size='sm'
              active={activeMobilePanel === 'record'}
              onClick={() => switchPanel('record')}
              role='tab'
              id='tab-record'
              aria-selected={activeMobilePanel === 'record'}
              aria-controls='panel-record'
            >
              <ClipboardList size={16} />
              기록
            </Button>
            <Button
              type='button'
              shape='round'
              variant='outline'
              size='sm'
              active={activeMobilePanel === 'profile'}
              onClick={() => switchPanel('profile')}
              role='tab'
              id='tab-profile'
              aria-selected={activeMobilePanel === 'profile'}
              aria-controls='panel-profile'
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
            onTouchCancel={handleTouchCancel}
          >
            <div
              className={`${styles.mobileSliderTrack} ${
                isDragging ? styles.dragging : ''
              }`}
              style={{
                transform: `translateX(calc(${basePercent}% + ${offsetPercent}%))`,
              }}
            >
              <div
                className={styles.mobileSlide}
                role='tabpanel'
                id='panel-record'
                aria-labelledby='tab-record'
                aria-hidden={activeMobilePanel !== 'record'}
              >
                <RecordForm />
              </div>
              <div
                className={styles.mobileSlide}
                role='tabpanel'
                id='panel-profile'
                aria-labelledby='tab-profile'
                aria-hidden={activeMobilePanel !== 'profile'}
              >
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
