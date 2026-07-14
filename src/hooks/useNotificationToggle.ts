'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';
import { subscribeAndSave } from '@/utils/pushSubscriptionUtils';

export function useNotificationToggle(userId?: string | null) {
  const [isNotificationOn, setIsNotificationOn] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [toggling, setToggling] = useState<boolean>(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    supabase
      .from('push_subscriptions')
      .select('is_active')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!isMounted) return;

        if (error) {
          console.error('알림 상태 조회 실패:', error);
        }

        setIsNotificationOn(data?.is_active ?? true);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const toggle = async () => {
    if (!userId || toggling) return;

    const next = !isNotificationOn;
    setToggling(true);

    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .update({ is_active: next })
        .eq('user_id', userId)
        .select('user_id');

      if (error) {
        toast.error(
          '알림 설정을 변경할 수 없어요. 잠시 후 다시 시도해 주세요.',
        );
        return;
      }

      if (!data || data.length === 0) {
        const resubscribed = await subscribeAndSave(userId);

        if (!resubscribed) {
          toast.error(
            '알림 권한이 필요해요. 브라우저 설정에서 알림을 허용한 뒤 다시 시도해 주세요.',
          );
          return;
        }

        setIsNotificationOn(true);
        toast.info('전체 알림을 켰어요!');
        return;
      }

      setIsNotificationOn(next);
      toast.info(next ? '전체 알림을 켰어요!' : '전체 알림을 껐어요!');
    } catch (e) {
      console.error('알림 토글 처리 중 예외 발생:', e);
      toast.error('알 수 없는 오류가 발생했어요.');
    } finally {
      setToggling(false);
    }
  };

  return { isNotificationOn, loading, toggling, toggle };
}
