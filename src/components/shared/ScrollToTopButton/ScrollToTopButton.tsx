'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowBigUp } from 'lucide-react';

import styles from './ScrollToTopButton.module.scss';

const SHOW_SCROLL_Y = 300;
const SCROLL_DELTA_THRESHOLD = 5;

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const ticking = useRef(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const updateVisibility = () => {
      const currentY = window.scrollY;

      if (currentY <= SHOW_SCROLL_Y) {
        setIsVisible(false);
        lastScrollY.current = currentY;
        ticking.current = false;
        return;
      }

      const delta = currentY - lastScrollY.current;

      if (Math.abs(delta) >= SCROLL_DELTA_THRESHOLD) {
        setIsVisible(delta < 0);
        lastScrollY.current = currentY;
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
      <ArrowBigUp size={22} fill='currentColor' aria-hidden='true' />
    </button>
  );
}
