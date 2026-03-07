import { useState } from 'react';

import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useProfileUpdate(user: User) {
  const [uploading, setUploading] = useState<boolean>(false);

  // 이미지 파일만 스토리지에 업로드하고 URL 반환
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

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

  // 전체 프로필 업데이트
  const saveFullProfile = async (
    nickname: string,
    status: string,
    avatarUrl: string,
  ) => {
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      nickname,
      status_message: status,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
    return true;
  };

  return { uploadImage, saveFullProfile, uploading };
}
