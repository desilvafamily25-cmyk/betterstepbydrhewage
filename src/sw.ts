/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'BetterStep', {
      body: data.body ?? 'You have a new message from Dr. Hewage.',
      icon: '/betterstep-app-icon.png',
      badge: '/favicon.png',
      tag: 'betterstep-message',
      renotify: true,
      data: { url: data.url ?? '/patient/messages' },
    })
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/patient/messages';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if ('focus' in client) return (client as WindowClient).focus();
        }
        return self.clients.openWindow(url);
      })
  );
});
