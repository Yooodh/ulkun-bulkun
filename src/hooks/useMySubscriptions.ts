'use client';

import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export function useMySubscriptions(myId?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['mySubscriptions', myId],
    queryFn: async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('target_id')
        .eq('subscriber_id', myId!);
      return new Set((data ?? []).map((row) => row.target_id));
    },
    enabled: !!myId,
  });

  return { subscribedIds: data ?? new Set<string>(), loading: isLoading };
}
