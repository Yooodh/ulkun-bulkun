'use client';

import { useEffect } from 'react';

import { subscribeAndSave } from '@/utils/pushSubscriptionUtils';

export function usePushNotification(userId: string | null) {
  useEffect(() => {
    if (!userId) return;
    subscribeAndSave(userId);
  }, [userId]);
}
