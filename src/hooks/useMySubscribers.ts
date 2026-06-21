'use client';

import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export function useMySubscribers(myId?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['mySubscribers', myId],
    queryFn: async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('subscriber_id')
        .eq('target_id', myId!);
      return new Set((data ?? []).map((row) => row.subscriber_id));
    },
    enabled: !!myId,
  });

  return { subscriberIds: data ?? new Set<string>(), loading: isLoading };
}
