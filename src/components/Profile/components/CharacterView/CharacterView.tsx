'use client';

import { useState } from 'react';

import { useBackgroundColor } from '@/hooks/useBackgroundColor';

import BackgroundColorButton from './BackgroundColor/BackgroundColorButton';
import Canvas from './Canvas';

import styles from './CharacterView.module.scss';

type CharacterViewProps = {
  totalPR?: number;
  userId?: string;
  backgroundColor?: string;
  canEdit?: boolean;
};

export default function CharacterView({
  totalPR = 0,
  userId,
  backgroundColor,
  canEdit = false,
}: CharacterViewProps) {
  const { color, saving, saveColor } = useBackgroundColor(
    userId,
    backgroundColor,
  );

  const [previewColor, setPreviewColor] = useState<string | null>(null);

  const displayColor = previewColor ?? color;

  const handleSave = (nextColor: string) => {
    setPreviewColor(null);
    saveColor(nextColor);
  };

  return (
    <div
      className={styles.characterContainer}
      style={{ background: displayColor }}
    >
      {canEdit && (
        <BackgroundColorButton
          color={color}
          onSave={handleSave}
          onPreview={setPreviewColor}
          saving={saving}
        />
      )}

      <div className={styles.canvasWrapper}>
        <Canvas totalPR={totalPR} />
      </div>
    </div>
  );
}
