'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';
import type { ProfileData } from '@/hooks/useProfile';

export function useBackgroundColor(
  userId: string | undefined,
  initialColor: string | undefined,
) {
  const color = initialColor || '#e3f2fd';
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const saveColor = async (nextColor: string) => {
    if (!userId) return;
    setSaving(true);

    const { data, error } = await supabase
      .from('profiles')
      .update({ background_color: nextColor })
      .eq('id', userId)
      .select('id');

    setSaving(false);

    if (error || !data?.length) {
      toast.error('배경 색상 저장에 실패했어요.', { id: 'profile-bg-error' });
      return;
    }

    queryClient.setQueryData(
      ['profile', userId],
      (current: ProfileData | undefined) =>
        current ? { ...current, background_color: nextColor } : current,
    );
    queryClient.invalidateQueries({ queryKey: ['profile', userId] });
  };

  return { color, saving, saveColor };
}
