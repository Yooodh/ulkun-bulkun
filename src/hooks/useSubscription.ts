'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';

export function useSubscription(targetId?: string, myId?: string) {
  const queryClient = useQueryClient();

  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!targetId || !myId || targetId === myId) {
      setLoading(false);
      return;
    }

    supabase
      .from('subscriptions')
      .select('id')
      .eq('subscriber_id', myId)
      .eq('target_id', targetId)
      .maybeSingle()
      .then(({ data }) => {
        setIsSubscribed(!!data);
        setLoading(false);
      });
  }, [targetId, myId]);

  const toggle = async () => {
    if (!targetId || !myId) return;

    if (isSubscribed) {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('subscriber_id', myId)
        .eq('target_id', targetId);

      if (!error) {
        setIsSubscribed(false);
        toast.info('구독을 취소했어요.');

        queryClient.setQueryData<Set<string>>(
          ['mySubscriptions', myId],
          (prev) => {
            const next = new Set(prev ?? []);
            next.delete(targetId);
            return next;
          },
        );

        queryClient.setQueryData<Set<string>>(
          ['mySubscribers', targetId],
          (prev) => {
            const next = new Set(prev ?? []);
            next.delete(myId);
            return next;
          },
        );
      }
    } else {
      const { error } = await supabase
        .from('subscriptions')
        .insert({ subscriber_id: myId, target_id: targetId });

      if (!error) {
        setIsSubscribed(true);
        toast.info('구독을 시작했어요!');

        queryClient.setQueryData<Set<string>>(
          ['mySubscriptions', myId],
          (prev) => new Set(prev ?? []).add(targetId),
        );
        queryClient.setQueryData<Set<string>>(
          ['mySubscribers', targetId],
          (prev) => new Set(prev ?? []).add(myId),
        );

        const {
          data: { session },
        } = await supabase.auth.getSession();

        fetch('/api/notify-new-subscriber', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token ?? ''}`,
          },
          body: JSON.stringify({ target_id: targetId }),
        }).catch((err) => console.error('구독 알림 에러:', err));
      }
    }
  };

  return { isSubscribed, loading, toggle };
}
