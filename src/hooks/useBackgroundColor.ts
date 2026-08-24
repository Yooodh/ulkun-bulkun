'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';

export function useBackgroundColor(
  userId: string | undefined,
  initialColor: string | undefined,
) {
  const [color, setColor] = useState(initialColor || '#e3f2fd');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialColor) setColor(initialColor);
  }, [initialColor]);

  const saveColor = async (nextColor: string) => {
    if (!userId) return;
    setSaving(true);

    const { data, error } = await supabase
      .from('profiles')
      .update({ background_color: nextColor })
      .eq('id', userId)
      .select();

    setSaving(false);

    console.log('userId:', userId);
    console.log('update result:', { data, error });

    if (error) {
      toast.error('배경 색상 저장에 실패했어요.');
      return;
    }

    setColor(nextColor);
    queryClient.invalidateQueries({ queryKey: ['profile', userId] });
  };

  return { color, saving, saveColor };
}
