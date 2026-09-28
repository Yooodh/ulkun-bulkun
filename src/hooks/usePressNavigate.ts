'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const DEFAULT_PRESS_DELAY_MS = 120;

export function usePressNavigate(href: string, delay = DEFAULT_PRESS_DELAY_MS) {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isModifiedClick =
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

    if (isModifiedClick) {
      return;
    }

    e.preventDefault();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsPressed(true);

    timeoutRef.current = setTimeout(() => {
      router.push(href);
    }, delay);
  };

  return { isPressed, handleClick };
}
