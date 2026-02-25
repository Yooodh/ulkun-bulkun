import { useState, useEffect, useCallback } from 'react';

import { supabase } from '@/lib/supabase';

export type ProfileData = {
  nickname: string;
  avatar_url: string;
  status_message: string;
};

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('nickname, avatar_url, status_message')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data as ProfileData);
    } catch (e) {
      const error = e as Error;
      console.error('프로필 로드 실패:', error.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    setProfile,
    refreshProfile: fetchProfile,
  };
}
