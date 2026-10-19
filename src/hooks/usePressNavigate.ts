'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const DEFAULT_RELEASE_DELAY_MS = 180;

export function usePressNavigate(
  href: string,
  delay = DEFAULT_RELEASE_DELAY_MS,
) {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.button !== 0) return;
    setIsPressed(true);
  };

  const handlePointerUp = () => setIsPressed(false);
  const handlePointerLeave = () => setIsPressed(false);
  const handlePointerCancel = () => setIsPressed(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isModifiedClick =
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

    if (isModifiedClick) return;

    e.preventDefault();

    setIsPressed(false);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      router.push(href);
    }, delay);
  };

  return {
    isPressed,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
      onPointerCancel: handlePointerCancel,
      onClick: handleClick,
    },
  };
}
