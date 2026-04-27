import { useState } from 'react';
import { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export function useProfileUpdate(user: User) {
  const [uploading, setUploading] = useState<boolean>(false);

  // 이미지 업로드
  const uploadImage = async (
    file: File,
    prevAvatarUrl?: string,
  ): Promise<string | null> => {
    try {
      setUploading(true);

      // 기존 이미지 삭제
      if (prevAvatarUrl) {
        // URL에서 폴더명/파일명만 추출
        const urlParts = prevAvatarUrl.split('/');
        const fileNameWithFolder = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;

        if (fileNameWithFolder.includes(user.id)) {
          // 내 폴더의 파일인지 확인
          await supabase.storage.from('avatar').remove([fileNameWithFolder]);
        }
      }

      const fileExt = file.name.split('.').pop();
      // 파일명 앞에 유저 ID와 /를 붙여 폴더 지정
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatar')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatar').getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // 전체 프로필 저장
  const saveFullProfile = async (
    nickname: string,
    status: string,
    avatarUrl: string,
    isPublic: boolean,
  ) => {
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        nickname: nickname || '울끈불끈이',
        status_message: status || '울끈불끈!',
        avatar_url: avatarUrl,
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Save error:', error);
      return false;
    }
  };

  // 프로필 리셋
  const resetProfile = async (): Promise<boolean> => {
    try {
      const meta = user.user_metadata;
      const originalNickname = meta?.full_name || meta?.name || '울끈불끈이';
      const originalAvatar = meta?.avatar_url || meta?.picture || '';

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        nickname: originalNickname,
        status_message: '울끈불끈!',
        avatar_url: originalAvatar,
        is_public: true,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Reset error:', error);
      return false;
    }
  };

  return { uploadImage, saveFullProfile, resetProfile, uploading };
}
