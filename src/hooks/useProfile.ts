import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export type ProfileData = {
  nickname: string;
  avatar_url: string;
  status_message: string;
  is_public: boolean;
};

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async (): Promise<ProfileData | null> => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('nickname, avatar_url, status_message, is_public')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        nickname: data.nickname || '울끈불끈이',

        avatar_url:
          data.avatar_url && data.avatar_url.trim() !== ''
            ? data.avatar_url
            : undefined,
        status_message: data.status_message || '울끈불끈!',
        is_public: data.is_public ?? true,
      };
    },
    enabled: !!userId,
  });
}
