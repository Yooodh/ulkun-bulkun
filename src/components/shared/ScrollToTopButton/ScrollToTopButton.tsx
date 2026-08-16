'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronUp } from 'lucide-react';

import styles from './ScrollToTopButton.module.scss';

const SHOW_SCROLL_Y = 300;
const SCROLL_DELTA_THRESHOLD = 10;

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const updateVisibility = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (currentY <= SHOW_SCROLL_Y) {
        setIsVisible(false);
      } else if (delta > SCROLL_DELTA_THRESHOLD) {
        setIsVisible(false);
        lastScrollY.current = currentY;
      } else if (delta < -SCROLL_DELTA_THRESHOLD) {
        setIsVisible(true);
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
    return () => window.removeEventListener('scroll', handleScroll);
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
