'use client';

import Image from 'next/image';
import { useState, useRef, ChangeEvent } from 'react';
import { User } from '@supabase/supabase-js';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';

import Button from '@/components/shared/Button/Button';
import Loading from '@/components/shared/Loading/Loading';
import { ConfirmToast } from '@/components/shared/ConfirmToast/ConfirmToast';

import { useProfileUpdate } from '@/hooks/useProfileUpdate';
import {
  isValidNickname,
  normalizeNickname,
  resolveResetNickname,
} from '@/utils/nicknameUtils';

import styles from './ProfileEdit.module.scss';

type ProfileEditProps = {
  user: User;
  initialNickname: string;
  initialAvatar: string;
  initialStatus: string;
  initialIsPublic: boolean;
  initialWeight: number | null;
  initialGender: 'male' | 'female' | null;
  initialBirthDate: string | null;
  onUpdate: (
    nickname: string,
    avatar: string,
    status: string,
    weight: number | null,
    gender: 'male' | 'female' | null,
    birthDate: string | null,
  ) => void;
  onEditingChange: (v: boolean) => void;
};

export default function ProfileEdit({
  user,
  initialNickname,
  initialAvatar,
  initialStatus,
  initialIsPublic,
  initialWeight,
  initialGender,
  initialBirthDate,
  onUpdate,
  onEditingChange,
}: ProfileEditProps) {
  const [tempNickname, setTempNickname] = useState<string>(initialNickname);
  const [tempStatus, setTempStatus] = useState<string>(initialStatus);
  const [tempAvatar, setTempAvatar] = useState<string>(initialAvatar);
  const [tempWeight, setTempWeight] = useState<string>(
    initialWeight != null ? String(initialWeight) : '',
  );
  const [tempGender, setTempGender] = useState<'male' | 'female' | null>(
    initialGender,
  );
  const [tempBirthDate, setTempBirthDate] = useState<string>(
    initialBirthDate ?? '',
  );

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

  const handleConfirmSave = (): void => {
    const normalizedNickname = normalizeNickname(tempNickname);
    const trimmedStatus = tempStatus.trim();

    if (!isValidNickname(normalizedNickname)) {
      toast.info('닉네임은 한글, 영문 소문자, 숫자로 2~10자 입력해 주세요.', {
        id: 'profile-edit-validation',
      });
      return;
    }
    if (trimmedStatus.length < 2) {
      toast.info('상태 메시지는 최소 2글자 이상 입력해 주세요.', {
        id: 'profile-edit-validation',
      });
      return;
    }
    if (trimmedStatus.length > 20) {
      toast.info('상태 메시지는 최대 20글자까지 가능합니다.', {
        id: 'profile-edit-validation',
      });
      return;
    }

    const parsedWeight = tempWeight.trim() !== '' ? Number(tempWeight) : null;
    if (parsedWeight !== null) {
      if (isNaN(parsedWeight) || parsedWeight < 30 || parsedWeight > 300) {
        toast.info('체중은 30kg ~ 300kg 사이로 입력해 주세요.', {
          id: 'profile-edit-validation',
        });
        return;
      }
    }

    const trimmedBirthDate = tempBirthDate.trim();
    if (trimmedBirthDate) {
      const birth = new Date(trimmedBirthDate);
      const today = new Date();
      if (isNaN(birth.getTime()) || birth > today) {
        toast.info('생년월일을 올바르게 입력해 주세요.', {
          id: 'profile-edit-validation',
        });
        return;
      }
      const age = today.getFullYear() - birth.getFullYear();
      if (age > 120 || age < 10) {
        toast.info('생년월일을 다시 확인해 주세요.', {
          id: 'profile-edit-validation',
        });
        return;
      }
    }

    ConfirmToast(
      '정말 변경하시겠습니까?',
      async () => {
        const success = await saveFullProfile(
          normalizedNickname,
          trimmedStatus,
          tempAvatar,
          initialIsPublic,
          parsedWeight,
          tempGender,
          trimmedBirthDate || null,
        );
        if (success) {
          onUpdate(
            normalizedNickname,
            tempAvatar,
            trimmedStatus,
            parsedWeight,
            tempGender,
            trimmedBirthDate || null,
          );
          onEditingChange(false);
          toast.success('프로필이 변경되었습니다!', {
            id: 'profile-edit-save',
          });
        }
      },
      undefined,
      'profile-edit-save-confirm',
    );
  };

  const handleCancel = () => {
    const isChanged =
      tempNickname !== initialNickname ||
      tempStatus !== initialStatus ||
      tempAvatar !== initialAvatar ||
      tempWeight !== (initialWeight != null ? String(initialWeight) : '') ||
      tempGender !== initialGender ||
      tempBirthDate !== (initialBirthDate ?? '');

    if (isChanged) {
      ConfirmToast(
        '수정 중인 내용은 저장되지 않습니다. 취소하시겠습니까?',
        () => onEditingChange(false),
        undefined,
        'profile-edit-cancel-confirm',
      );
    } else {
      onEditingChange(false);
    }
  };

  const handleReset = (): void => {
    ConfirmToast(
      '프로필을 처음 상태로 초기화할까요?',
      async () => {
        const metadataNickname =
          user.user_metadata?.full_name || user.user_metadata?.name;
        const defaultNickname = resolveResetNickname(
          metadataNickname,
          initialNickname,
        );
        const success = await resetProfile(initialNickname);
        if (success) {
          const defaultAvatar =
            user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
          const defaultStatus = '울끈불끈!';
          setTempNickname(defaultNickname);
          setTempAvatar(defaultAvatar);
          setTempStatus(defaultStatus);
          setTempWeight('');
          setTempGender(null);
          setTempBirthDate('');
          onUpdate(
            defaultNickname,
            defaultAvatar,
            defaultStatus,
            null,
            null,
            null,
          );
          onEditingChange(false);
          toast.success('프로필이 초기화되었습니다!', {
            id: 'profile-edit-reset',
          });
        }
      },
      undefined,
      'profile-edit-reset-confirm',
    );
  };

  const handleDeleteAccount = (): void => {
    ConfirmToast(
      '정말 탈퇴하시겠습니까?',
      () => {
        ConfirmToast(
          '모든 데이터가 삭제되며\n 복구할 수 없습니다.\n 정말 탈퇴하시겠습니까?',
          async () => {
            const success = await deleteAccount();
            if (success) {
              toast.success('탈퇴가 완료되었습니다.', {
                id: 'profile-edit-delete',
              });
              setTimeout(() => {
                window.location.href = '/';
              }, 1200);
            } else {
              toast.error(
                '탈퇴 처리 중 오류가 발생했습니다. 다시 시도해 주세요.',
                { id: 'profile-edit-delete-error' },
              );
            }
          },
          undefined,
          'profile-edit-delete-confirm-2',
        );
      },
      undefined,
      'profile-edit-delete-confirm-1',
    );
  };

  return (
    <div className={styles.editContainer}>
      <div className={styles.editWrapper}>
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
              <div className={`${styles.avatar} ${styles.defaultAvatar}`}>
                💪
              </div>
            )}
            <div
              className={`${styles.avatarOverlay} ${uploading ? styles.uploading : ''}`}
            >
              {uploading ? (
                <Loading size='sm' message='' />
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
                placeholder='한글, 영문 소문자, 숫자 (2~10자)'
                maxLength={10}
              />
              <span>{tempNickname.length}/10</span>
            </div>
          </div>

          <div className={styles.field}>
            <label>성별</label>
            <div className={styles.genderToggle}>
              <button
                type='button'
                className={`${styles.genderBtn} ${styles.male} ${
                  tempGender === 'male' ? styles.active : ''
                }`}
                onClick={() => setTempGender('male')}
              >
                남성
              </button>
              <button
                type='button'
                className={`${styles.genderBtn} ${styles.female} ${
                  tempGender === 'female' ? styles.active : ''
                }`}
                onClick={() => setTempGender('female')}
              >
                여성
              </button>
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label>체중 (kg)</label>
              <div className={styles.inputWrapper}>
                <input
                  type='number'
                  value={tempWeight}
                  onChange={(e) => setTempWeight(e.target.value)}
                  placeholder='체중 (선택)'
                  min={30}
                  max={300}
                />
                <span>kg</span>
              </div>
            </div>

            <div className={styles.field}>
              <label>생년월일</label>
              <div className={styles.inputWrapper}>
                <input
                  type='date'
                  className={styles.dateInput}
                  value={tempBirthDate}
                  onChange={(e) => setTempBirthDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.editBtns}>
        <Button variant='ligray' size='md' onClick={handleCancel}>
          취소
        </Button>
        <Button variant='blue' size='md' onClick={handleConfirmSave}>
          저장
        </Button>
      </div>

      <div className={styles.dangerZone}>
        <button
          type='button'
          className={styles.dangerLink}
          onClick={handleReset}
        >
          프로필 초기화
        </button>
        <button
          type='button'
          className={`${styles.dangerLink} ${styles.deleteLink}`}
          onClick={handleDeleteAccount}
        >
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}
