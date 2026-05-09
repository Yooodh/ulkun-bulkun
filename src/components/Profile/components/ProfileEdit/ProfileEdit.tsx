'use client';

import Image from 'next/image';
import { useState, useRef, ChangeEvent } from 'react';
import { User } from '@supabase/supabase-js';
import { Camera } from 'lucide-react';

import styles from './ProfileEdit.module.scss';

import Button from '@/components/shared/Button/Button';
import Loading from '@/components/shared/Loading/Loading';

import { useProfileUpdate } from '@/hooks/useProfileUpdate';

type ProfileEditProps = {
  user: User;
  initialNickname: string;
  initialAvatar: string;
  initialStatus: string;
  initialIsPublic: boolean;
  onUpdate: (nickname: string, avatar: string, status: string) => void;
  onEditingChange: (v: boolean) => void;
};

export default function ProfileEdit({
  user,
  initialNickname,
  initialAvatar,
  initialStatus,
  initialIsPublic,
  onUpdate,
  onEditingChange,
}: ProfileEditProps) {
  const [tempNickname, setTempNickname] = useState<string>(initialNickname);
  const [tempStatus, setTempStatus] = useState<string>(initialStatus);
  const [tempAvatar, setTempAvatar] = useState<string>(initialAvatar);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    uploadImage,
    saveFullProfile,
    resetProfile,
    deleteAccount,
    uploading,
  } = useProfileUpdate(user);

  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    const publicUrl = await uploadImage(file, tempAvatar);
    if (publicUrl) setTempAvatar(publicUrl);
  };

  const handleConfirmSave = async (): Promise<void> => {
    const trimmedNickname = tempNickname.trim();
    const trimmedStatus = tempStatus.trim();

    if (trimmedNickname.length < 2) {
      alert('닉네임은 최소 2글자 이상 입력해 주세요.');
      return;
    }
    if (trimmedNickname.length > 10) {
      alert('닉네임은 최대 10글자까지 가능합니다.');
      return;
    }
    if (trimmedStatus.length < 2) {
      alert('상태 메시지는 최소 2글자 이상 입력해 주세요.');
      return;
    }
    if (trimmedStatus.length > 20) {
      alert('상태 메시지는 최대 20글자까지 가능합니다.');
      return;
    }

    if (confirm('정말 변경하시겠습니까?')) {
      const success = await saveFullProfile(
        trimmedNickname,
        trimmedStatus,
        tempAvatar,
        initialIsPublic,
      );
      if (success) {
        onUpdate(trimmedNickname, tempAvatar, trimmedStatus);
        onEditingChange(false);
        alert('프로필이 변경되었습니다!');
      }
    }
  };

  const handleCancel = () => {
    const isChanged =
      tempNickname !== initialNickname ||
      tempStatus !== initialStatus ||
      tempAvatar !== initialAvatar;

    if (isChanged) {
      if (confirm('수정 중인 내용은 저장되지 않습니다. 취소하시겠습니까?')) {
        onEditingChange(false);
      }
    } else {
      onEditingChange(false);
    }
  };

  const handleReset = async (): Promise<void> => {
    if (!confirm('프로필을 처음 상태로 초기화할까요?')) return;
    const success = await resetProfile();
    if (success) {
      const defaultNickname =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        '울끈불끈이';
      const defaultAvatar =
        user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
      const defaultStatus = '울끈불끈!';
      setTempNickname(defaultNickname);
      setTempAvatar(defaultAvatar);
      setTempStatus(defaultStatus);
      onUpdate(defaultNickname, defaultAvatar, defaultStatus);
      onEditingChange(false);
      alert('프로필이 초기화되었습니다!');
    }
  };

  const handleDeleteAccount = async (): Promise<void> => {
    if (!confirm('정말 탈퇴하시겠습니까?')) return;
    if (
      !confirm(
        '모든 데이터가 삭제되며 복구할 수 없습니다.\n정말 탈퇴하시겠습니까?',
      )
    )
      return;

    const success = await deleteAccount();
    if (success) {
      alert('탈퇴가 완료되었습니다.');
      window.location.href = '/';
    } else {
      alert('탈퇴 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <div className={styles.editContainer}>
      <div className={styles.avatarContainer}>
        <div
          className={styles.avatarWrapper}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {tempAvatar ? (
            <Image
              src={tempAvatar}
              alt={`${tempNickname}님의 프로필 편집`}
              className={styles.avatar}
              width={85}
              height={85}
              unoptimized
            />
          ) : (
            <div className={`${styles.avatar} ${styles.defaultAvatar}`}>💪</div>
          )}
          <div className={styles.avatarOverlay}>
            {uploading ? (
              <div className={styles.avatarLoading}>
                <Loading size='sm' message='' />
              </div>
            ) : (
              <Camera size={18} strokeWidth={2} />
            )}
          </div>
        </div>
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          hidden
          accept='image/*'
        />
      </div>

      <div className={styles.fieldList}>
        <div className={styles.field}>
          <label>상태 메시지</label>
          <div className={styles.inputWrapper}>
            <input
              type='text'
              value={tempStatus}
              onChange={(e) => setTempStatus(e.target.value)}
              placeholder='상태 메시지를 입력해주세요.'
              maxLength={20}
              autoFocus
            />
            <span>{tempStatus.length}/20</span>
          </div>
        </div>

        <div className={styles.field}>
          <label>닉네임</label>
          <div className={styles.inputWrapper}>
            <input
              type='text'
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
              placeholder='닉네임을 입력해주세요.'
              maxLength={10}
            />
            <span>{tempNickname.length}/10</span>
          </div>
        </div>
      </div>

      <div className={styles.editBtns}>
        <Button variant='blue' size='sm' onClick={handleConfirmSave}>
          저장
        </Button>
        <Button variant='gray' size='sm' onClick={handleCancel}>
          취소
        </Button>
      </div>

      <div className={styles.dangerBtns}>
        <Button variant='ligray' size='sm' onClick={handleReset}>
          프로필 초기화
        </Button>
        <Button variant='red' size='sm' onClick={handleDeleteAccount}>
          회원 탈퇴
        </Button>
      </div>
    </div>
  );
}
