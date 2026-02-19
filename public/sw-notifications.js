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

// Show a notification on demand — triggered by postMessage from the app
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SHOW_REMINDER') {
    event.waitUntil(
      self.registration.showNotification(event.data.title ?? 'FitGame Pro', {
        body: event.data.body ?? '\u00a1Es hora de entrenar!',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'workout-reminder',
        renotify: false,
      })
    );
  }
});
