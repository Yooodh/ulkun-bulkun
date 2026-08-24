'use client';

import { useEffect, useRef, useState } from 'react';

import { ConfirmToast } from '@/components/shared/ConfirmToast/ConfirmToast';

import styles from './BackgroundColorButton.module.scss';

type BackgroundColorButtonProps = {
  color: string;
  onSave: (color: string) => void;
  onPreview: (color: string) => void;
  saving?: boolean;
};

export default function BackgroundColorButton({
  color,
  onSave,
  onPreview,
  saving,
}: BackgroundColorButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draftColor, setDraftColor] = useState(color);

  useEffect(() => {
    setDraftColor(color);
  }, [color]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleChange = (e: Event) => {
      const value = (e.target as HTMLInputElement).value;

      ConfirmToast(
        '배경 색상을 변경하시겠습니까?',
        () => onSave(value),
        () => {
          setDraftColor(color);
          onPreview(color);
        },
      );
    };

    input.addEventListener('change', handleChange);
    return () => input.removeEventListener('change', handleChange);
  }, [onSave, onPreview, color]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDraftColor(value);
    onPreview(value);
  };

  return (
    <div className={styles.wrapper}>
      <button
        type='button'
        className={styles.button}
        onClick={handleClick}
        disabled={saving}
        aria-label='배경 색상 변경'
      >
        <span className={styles.swatch} style={{ backgroundColor: color }} />
      </button>
      <input
        ref={inputRef}
        type='color'
        value={draftColor}
        onChange={handleInput}
        className={styles.hiddenInput}
      />
    </div>
  );
}
