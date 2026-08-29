'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronUp } from 'lucide-react';

import styles from './ScrollToTopButton.module.scss';

const SHOW_SCROLL_Y = 300;
const HIDE_DELAY_MS = 1000;

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const ticking = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearHideTimer = () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
    };

    const updateVisibility = () => {
      const currentY = window.scrollY;

      if (currentY <= SHOW_SCROLL_Y) {
        setIsVisible(false);
        clearHideTimer();
      } else {
        setIsVisible(true);

        clearHideTimer();
        hideTimer.current = setTimeout(() => {
          setIsVisible(false);
        }, HIDE_DELAY_MS);
      }

      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateVisibility);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearHideTimer();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type='button'
      className={styles.scrollToTopButton}
      data-visible={isVisible}
      onClick={scrollToTop}
      aria-label='맨 위로 가기'
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
    >
      <ChevronUp size={22} aria-hidden='true' />
    </button>
  );
}
