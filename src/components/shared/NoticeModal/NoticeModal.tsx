'use client';

import { useCallback, useEffect, useState } from 'react';

import Button from '../Button/Button';

import { fetchNotice, NOTICE_STORAGE_KEY, type Notice } from '@/lib/notice';

import styles from './NoticeModal.module.scss';

export default function NoticeModal() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchNotice().then((data) => {
      if (cancelled || !data) return;
      setNotice(data);
      try {
        const dismissed = localStorage.getItem(NOTICE_STORAGE_KEY);
        if (dismissed !== data.version) setOpen(true);
      } catch {
        setOpen(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleClose = useCallback(() => {
    if (dontShowAgain && notice) {
      try {
        localStorage.setItem(NOTICE_STORAGE_KEY, notice.version);
      } catch {}
    }
    setOpen(false);
  }, [dontShowAgain, notice]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, handleClose]);

  if (!open || !notice) return null;

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
          <span className={styles.date}>{notice.date}</span>
          <span className={styles.badge}>{notice.version}</span>
        </div>

        <h2 id='notice-title' className={styles.title}>
          {notice.title}
        </h2>

        <ul className={styles.list}>
          {notice.content.map((item, i) => (
            <li key={i} className={styles.item}>
              <span className={styles.itemTitle}>{item.title}</span>
              {item.description && (
                <span className={styles.itemDescription}>
                  {item.description}
                </span>
              )}
            </li>
          ))}
        </ul>

        {!!notice.highlight?.trim() && (
          <div className={styles.highlight}>{notice.highlight}</div>
        )}

        <div className={styles.footer}>
          <label className={styles.checkbox}>
            <input
              type='checkbox'
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            다시 보지 않기
          </label>

          {notice.link_url && /^https?:\/\//.test(notice.link_url) && (
            <a
              href={notice.link_url}
              target='_blank'
              rel='noopener noreferrer'
              className={styles.link}
            >
              자세히 보기
            </a>
          )}
        </div>

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
