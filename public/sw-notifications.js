// FitGame Pro — Custom SW notification handlers
// Loaded via importScripts() by the workbox-generated service worker.

// Focus the app window (or open a new one) when user taps a notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        const appClient = windowClients.find((c) =>
          c.url.startsWith(self.location.origin)
        );
        if (appClient) return appClient.focus();
        return clients.openWindow('/');
      })
  );
});

// Show a notification on demand — triggered by postMessage from the app.
// Supports an optional `tag` field so different notification types
// (reminders, badges, PRs, challenges) don't suppress each other.
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'SHOW_REMINDER') return;

  const title = event.data.title ?? 'FitGame Pro';
  const body  = event.data.body  ?? '¡Es hora de entrenar!';
  const tag   = event.data.tag   ?? 'workout-reminder';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag,
      renotify: true,
    })
  );
});
