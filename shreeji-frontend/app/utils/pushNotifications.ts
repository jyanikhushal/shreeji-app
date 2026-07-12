// utils/pushNotifications.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function subscribeToPushNotifications(malikPhone: string, customerPhone: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications are not supported in this browser');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted');
  }

  const registration = await navigator.serviceWorker.register('/service-worker.js');
  await navigator.serviceWorker.ready;

  const vapidRes = await fetch(`${API_URL}/api/push/vapid-public-key`);
  const { publicKey } = await vapidRes.json();

  const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
});

  const res = await fetch(`${API_URL}/api/push/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ malikPhone, customerPhone, subscription }),
  });

  if (!res.ok) {
    throw new Error('Failed to save subscription on server');
  }

  return subscription;
}