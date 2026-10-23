'use client';

import { useCallback, useEffect, useState } from 'react';

import Button from '../Button/Button';

import { NOTICE, NOTICE_STORAGE_KEY } from '@/lib/notice';

import styles from './NoticeModal.module.scss';

export default function NoticeModal() {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!NOTICE) return;
    try {
      const dismissed = localStorage.getItem(NOTICE_STORAGE_KEY);
      if (dismissed !== NOTICE.version) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const handleClose = useCallback(() => {
    if (dontShowAgain && NOTICE) {
      try {
        localStorage.setItem(NOTICE_STORAGE_KEY, NOTICE.version);
      } catch {}
    }
    setOpen(false);
  }, [dontShowAgain]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, handleClose]);

  if (!open || !NOTICE) return null;

  return (
    <div
      className={styles.overlay}
      onClick={handleClose}
      role='dialog'
      aria-modal='true'
      aria-labelledby='notice-title'
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.meta}>
          <span className={styles.date}>{NOTICE.date}</span>
          <span className={styles.badge}>{NOTICE.version}</span>
        </div>

        <h2 id='notice-title' className={styles.title}>
          {NOTICE.title}
        </h2>

        <ul className={styles.list}>
          {NOTICE.content.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        {!!NOTICE.highlight?.trim() && (
          <div className={styles.highlight}>{NOTICE.highlight}</div>
        )}

        <label className={styles.checkbox}>
          <input
            type='checkbox'
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
          />
          다시 보지 않기
        </label>

        <Button
          variant='blue'
          type='button'
          className={styles.button}
          onClick={handleClose}
        >
          닫기
        </Button>
      </div>
    </div>
  );
}
