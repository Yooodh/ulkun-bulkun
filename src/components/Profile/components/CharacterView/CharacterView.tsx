'use client';

import { useState } from 'react';

import Loading from '@/components/shared/Loading/Loading';

import { useBackgroundColor } from '@/hooks/useBackgroundColor';

import BackgroundColorButton from './BackgroundColor/BackgroundColorButton';
import Canvas from './Canvas';

import styles from './CharacterView.module.scss';

type CharacterViewProps = {
  isLoading?: boolean;
  totalPR?: number;
  userId?: string;
  backgroundColor?: string;
  canEdit?: boolean;
};

export default function CharacterView({
  isLoading,
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

      <div>
        {isLoading ? (
          <Loading message='캐릭터를 불러오고 있어요!' />
        ) : (
          <Canvas totalPR={totalPR} />
        )}
      </div>
    </div>
  );
}
