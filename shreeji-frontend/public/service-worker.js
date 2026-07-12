// public/service-worker.js
// This runs in the background and is what actually displays the notification when a push arrives.
self.addEventListener('push', function (event) {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  // Later we can route to a specific page based on event.notification.data.type
  event.waitUntil(
    clients.openWindow('/')
  );
});