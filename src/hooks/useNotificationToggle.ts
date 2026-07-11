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

    const { data, error } = await supabase
      .from('push_subscriptions')
      .update({ is_active: next })
      .eq('user_id', userId)
      .select('user_id');

    if (error) {
      setToggling(false);
      console.error('알림 상태 변경 실패:', error);
      toast.error('알림 설정을 변경하지 못했어요. 잠시 후 다시 시도해주세요.');
      return;
    }

    // 구독 row가 없는 상태일 때 자동 재구독 시도
    if (!data || data.length === 0) {
      const resubscribed = await subscribeAndSave(userId);
      setToggling(false);

      if (!resubscribed) {
        toast.error(
          '알림 권한이 필요해요. 브라우저 설정에서 알림을 허용한 뒤 다시 시도해주세요.',
        );
        return;
      }

      setIsNotificationOn(true);
      toast.info('전체 알림을 켰어요!');
      return;
    }

    setToggling(false);
    setIsNotificationOn(next);
    toast.info(next ? '전체 알림을 켰어요!' : '전체 알림을 껐어요!');
  };

  return { isNotificationOn, loading, toggling, toggle };
}
