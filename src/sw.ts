import { defaultCache } from '@serwist/turbopack/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: defaultCache,
});

self.addEventListener('push', (event) => {
  let data: { title?: string; body?: string; url?: string } = {};
  try {
    data = (event as PushEvent).data?.json() ?? {};
  } catch {
    data = { body: (event as PushEvent).data?.text() };
  }

  const title = data.title || '울끈불끈';
  const options = {
    body: data.body || '운동 기록을 남겨보세요!',

    // 알림 본문 옆에 표시되는 큰 아이콘
    icon: '/assets/images/ulkun-bulkun_app_logo.png',

    // 안드로이드 상태 표시줄에 뜨는 작은 알림 아이콘
    badge: '/assets/images/ulkun-bulkun_badge.png',
    data: { url: data.url || '/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  const notificationEvent = event as NotificationEvent;
  notificationEvent.notification.close();

  const requestedUrl = notificationEvent.notification.data?.url;
  let targetUrl = new URL('/', self.location.origin);

  if (typeof requestedUrl === 'string') {
    try {
      const candidateUrl = new URL(requestedUrl, self.location.origin);
      if (candidateUrl.origin === self.location.origin) {
        targetUrl = candidateUrl;
      }
    } catch {
    }
  }

  notificationEvent.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      for (const windowClient of windows) {
        await windowClient.navigate(targetUrl.href);
        return windowClient.focus();
      }

      return self.clients.openWindow(targetUrl.href);
    })(),
  );
});

serwist.addEventListeners();
