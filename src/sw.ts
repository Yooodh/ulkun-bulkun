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
  let data: { title?: string; body?: string } = {};
  try {
    data = (event as PushEvent).data?.json() ?? {};
  } catch {
    data = { body: (event as PushEvent).data?.text() };
  }

  const title = data.title || '울끈불끈';
  const options = {
    body: data.body || '운동 기록을 남겨보세요!',
    icon: '/assets/images/muscle.png',
    badge: '/assets/images/muscle.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  (event as NotificationEvent).notification.close();
  event.waitUntil(self.clients.openWindow('/'));
});

serwist.addEventListeners();
