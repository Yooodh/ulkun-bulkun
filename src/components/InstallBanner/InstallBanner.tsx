'use client';

import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { SquareArrowUp, ArrowRight, X } from 'lucide-react';

import styles from './InstallBanner.module.scss';

import Button from '../shared/Button/Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const BANNER_DISMISSED_KEY = 'installBannerDismissed';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    const isStandalone = window.matchMedia(
      '(display-mode: standalone)',
    ).matches;
    if (isDismissed || isStandalone) return;

    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    if (ios) {
      setShowBanner(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowBanner(false);
    } catch (e) {
      console.error('설치 프롬프트 오류:', e);
    } finally {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
  }, []);

  if (!showBanner) return null;

  return (
    <div className={styles.bannerContainer}>
      <div className={styles.contentWrapper}>
        <Image
          width={50}
          height={50}
          src='/assets/images/muscle.png'
          alt='앱 아이콘'
          className={styles.icon}
        />
        <div className={styles.text}>
          <strong>울끈불끈</strong>
          {isIOS ? (
            <p>
              <span>
                Safari 하단 공유버튼
                <SquareArrowUp size={16} className={styles.sharedBtn} />
              </span>
              <ArrowRight size={16} className={styles.arrow} />
              <strong>"홈 화면에 추가"</strong>를 누르세요
            </p>
          ) : (
            <p>홈 화면에 추가하고 앱처럼 사용하세요!</p>
          )}
        </div>
      </div>
      <div className={styles.actionWrapper}>
        {!isIOS && deferredPrompt && (
          <Button variant='white' size='md' onClick={handleInstall}>
            설치
          </Button>
        )}
        <button
          className={styles.dismissButton}
          onClick={handleDismiss}
          aria-label='닫기'
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
}
