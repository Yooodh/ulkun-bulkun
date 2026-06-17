'use client';

import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function usePushNotification(userId: string | null) {
  useEffect(() => {
    if (!userId) return;
    if (!('serviceWorker' in navigator)) return;
    if (!('PushManager' in window)) return;
    if (!VAPID_PUBLIC_KEY) return;

    async function register() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const registration =
          await navigator.serviceWorker.register('/serwist/sw.js');

        await navigator.serviceWorker.ready;

        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
        }

        const { data: existing } = await supabase
          .from('push_subscriptions')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from('push_subscriptions')
            .update({ subscription: subscription.toJSON() })
            .eq('user_id', userId);

          if (error) throw error;
        } else {
          const { error } = await supabase.from('push_subscriptions').insert({
            user_id: userId,
            subscription: subscription.toJSON(),
            is_active: true,
          });

          if (error) throw error;
        }
      } catch (error) {
        console.error('[Push] 에러 발생 원인:', error);
      }
    }

    register();
  }, [userId]);
}
