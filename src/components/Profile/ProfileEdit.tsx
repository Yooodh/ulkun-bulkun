'use client';

import { useState, useRef, ChangeEvent } from 'react';

import styles from './Profile.module.scss';

import { User } from '@supabase/supabase-js';
import { useProfileUpdate } from '@/hooks/useProfileUpdate';

import Button from '../shared/Button/Button';

type ProfileEditProps = {
  user: User;
  initialNickname: string;
  initialAvatar: string;
  initialStatus: string;
  onUpdate: (nickname: string, avatar: string, status: string) => void;
};

export default function ProfileEdit({
  user,
  initialNickname,
  initialAvatar,
  initialStatus,
  onUpdate,
}: ProfileEditProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempNickname, setTempNickname] = useState<string>(initialNickname);
  const [tempStatus, setTempStatus] = useState<string>(initialStatus);
  const [tempAvatar, setTempAvatar] = useState<string>(initialAvatar);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { uploadImage, saveFullProfile, uploading } = useProfileUpdate(user);

  const startEditing = (): void => {
    setTempNickname(initialNickname);
    setTempStatus(initialStatus);
    setTempAvatar(initialAvatar);
    setIsEditing(true);
  };

  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    const publicUrl = await uploadImage(file);
    if (publicUrl) {
      setTempAvatar(publicUrl);
    }
  };

  const handleConfirmSave = async (): Promise<void> => {
    const trimmedNickname = tempNickname.trim();
    if (!trimmedNickname) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    if (confirm('정말 변경하시겠습니까?')) {
      try {
        const success = await saveFullProfile(
          trimmedNickname,
          tempStatus,
          tempAvatar,
        );
        if (success) {
          onUpdate(trimmedNickname, tempAvatar, tempStatus);
          setIsEditing(false);
          alert('프로필이 변경되었습니다!');
        }
      } catch (err) {
        alert('변경 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className={styles.editContainer}>
      <div
        className={`${styles.avatarWrapper} ${isEditing ? styles.editable : ''}`}
        onClick={() => isEditing && !uploading && fileInputRef.current?.click()}
      >
        <img
          src={
            (isEditing ? tempAvatar : initialAvatar) || '/default-avatar.png'
          }
          alt='profile'
          className={styles.avatar}
        />

        {isEditing && (
          <div className={styles.avatarOverlay}>
            {uploading ? '...' : '변경'}
          </div>
        )}

        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          hidden
          accept='image/*'
        />
      </div>

      <div className={styles.nameWrapper}>
        {isEditing ? (
          <div className={styles.editWrapper}>
            <input
              type='text'
              value={tempStatus}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setTempStatus(e.target.value)
              }
              className={styles.statusInput}
              placeholder='상태 메시지'
              autoFocus
            />
            <input
              type='text'
              value={tempNickname}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setTempNickname(e.target.value)
              }
              className={styles.nicknameInput}
              placeholder='닉네임'
            />
            <div className={styles.editBtns}>
              <Button
                variant='blue'
                size='sm'
                onClick={handleConfirmSave}
                className={styles.saveBtn}
              >
                저장
              </Button>
              <Button
                variant='gray'
                size='sm'
                onClick={() => setIsEditing(false)}
                className={styles.cancelBtn}
              >
                취소
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.editBox}>
            <div className={styles.textGroup}>
              <span className={styles.subText}>{initialStatus}</span>
              <h2 className={styles.nickname}>{initialNickname || '사용자'}</h2>
            </div>
            <Button
              variant='blue'
              size='sm'
              className={styles.changeBtn}
              onClick={startEditing}
            >
              수정
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
