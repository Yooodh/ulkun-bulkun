import { supabase } from '@/lib/supabase';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

/**
 * 서비스워커 등록 + 푸시 구독 + DB 저장까지 한 번에 처리하는 함수
 * 성공하면 true, 실패(권한 거부 포함)하면 false 반환.
 */
export async function subscribeAndSave(userId: string): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  if (!('PushManager' in window)) return false;
  if (!VAPID_PUBLIC_KEY) return false;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const registration = await navigator.serviceWorker.register(
      '/serwist/sw.js',
      {
        scope: '/',
      },
    );

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
        .update({ subscription: subscription.toJSON(), is_active: true })
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

    return true;
  } catch (error) {
    console.error('[Push] 구독 저장 실패:', error);
    return false;
  }
}
