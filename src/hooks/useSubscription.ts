'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';

export function useSubscription(targetId?: string, myId?: string) {
  const queryClient = useQueryClient();

  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [toggling, setToggling] = useState<boolean>(false);

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
    if (!targetId || !myId || toggling) return;
    setToggling(true);

    try {
      if (isSubscribed) {
        const { error } = await supabase
          .from('subscriptions')
          .delete()
          .eq('subscriber_id', myId)
          .eq('target_id', targetId);

        if (error) {
          toast.error('팔로우 처리에 실패했어요. 잠시 후 다시 시도해 주세요.', {
            id: 'subscription-error',
          });
          return;
        }

        setIsSubscribed(false);
        toast.info('팔로우를 취소했어요.', { id: 'subscription-toggle' });

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
      } else {
        const { error } = await supabase
          .from('subscriptions')
          .insert({ subscriber_id: myId, target_id: targetId });

        if (error) {
          toast.error('팔로우 처리에 실패했어요. 잠시 후 다시 시도해 주세요.', {
            id: 'subscription-error',
          });
          return;
        }

        setIsSubscribed(true);
        toast.info('팔로우를 시작했어요!', { id: 'subscription-toggle' });

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
        }).catch((err) => console.error('팔로우 알림 에러:', err));
      }
    } catch (e) {
      console.error('팔로우 처리 중 예외 발생:', e);
      toast.error('알 수 없는 오류가 발생했어요.', {
        id: 'subscription-error',
      });
    } finally {
      setToggling(false);
    }
  };

  return { isSubscribed, loading, toggle };
}
